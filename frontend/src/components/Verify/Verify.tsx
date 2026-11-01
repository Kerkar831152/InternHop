
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { apiRequest } from "../../api";

type OpportunityType = "internship" | "hackathon" | "unknown";

interface ScanResult {
    opportunity_type: OpportunityType;
    title: string | null;
    organisation: string | null;
    location: string | null;
    country: string | null;
    description: string | null;
    eligibility: string | null;
    skills: string | null;
    stipend: string | null;
    internship_type: string | null;
    themes: string | null;
    event_type: string | null;
    participation_mode: string | null;
    deadline: string | null;
    registration_deadline: string | null;
    start_date: string | null;
    end_date: string | null;
    application_url: string | null;
    qr_code_content: string | null;
    missing_fields: string[];
    notes: string | null;
}

interface ScanResponse {
    message: string;
    result: ScanResult;
}

function Verify() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [result, setResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function selectImage(file: File | undefined) {
        setError("");
        setSuccess("");
        setResult(null);

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("Image size must be below 10 MB.");
            return;
        }

        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        selectImage(event.target.files?.[0]);
        event.target.value = "";
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        selectImage(event.dataTransfer.files[0]);
    }

    async function handleScan() {
        if (!image) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("image", image);

            const response = await apiRequest<ScanResponse>(
                "/opportunities/scan-image/",
                {
                    method: "POST",
                    body: formData,
                }
            );

            setResult(response.result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Image analysis failed."
            );
        } finally {
            setLoading(false);
        }
    }

    function updateField(
        field: keyof ScanResult,
        value: string
    ) {
        setResult((previous) => {
            if (!previous) return previous;

            return {
                ...previous,
                [field]: value,
            };
        });
    }

    async function handleSave() {
        if (!result) return;

        if (
            result.opportunity_type !== "internship" &&
            result.opportunity_type !== "hackathon"
        ) {
            setError("Please select Internship or Hackathon.");
            return;
        }

        if (!result.title?.trim() || !result.organisation?.trim()) {
            setError("Title and organisation are required.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (result.opportunity_type === "internship") {
                await apiRequest("/internships/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: result.title,
                        company: result.organisation,
                        location: result.location ?? "",
                        description: result.description ?? "",
                        skills: result.skills ?? "",
                        stipend: result.stipend ?? "",
                        internship_type: result.internship_type ?? "",
                        deadline: result.deadline || null,
                        source_url:
                            result.application_url ||
                            result.qr_code_content ||
                            "",
                    }),
                });
            } else {
                await apiRequest("/hackathons/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: result.title,
                        organizer: result.organisation,
                        location: result.location ?? "",
                        country: result.country ?? "",
                        description: result.description ?? "",
                        themes: result.themes ?? "",
                        event_type: result.event_type ?? "",
                        participation_mode:
                            result.participation_mode || "online",
                        registration_deadline:
                            result.registration_deadline ||
                            result.deadline ||
                            null,
                        start_date: result.start_date || null,
                        end_date: result.end_date || null,
                        source_url:
                            result.application_url ||
                            result.qr_code_content ||
                            "",
                    }),
                });
            }

            setSuccess("Opportunity saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not save the opportunity."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleRemoveImage() {
        setImage(null);
        setPreviewUrl("");
        setResult(null);
        setError("");
        setSuccess("");
    }

    function renderField(
        label: string,
        field: keyof ScanResult,
        type = "text"
    ) {
        const value = result?.[field];

        return (
            <div className="scan-edit-field" key={field}>
                <label>{label}</label>
                <input
                    type={type}
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                        updateField(field, event.target.value)
                    }
                />
            </div>
        );
    }

    return (
        <section className="image-check-page">
            <header className="image-check-header">
                <span className="image-check-eyebrow">
                    OPPORTUNITY SCANNER
                </span>
                <h1>Scan an opportunity</h1>
                <p>
                    Upload an internship or hackathon poster.
                    AI will extract its details for you to review.
                </p>
            </header>

            <section className="image-check-panel">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                />

                <div
                    className={`image-drop-zone${dragging ? " is-dragging" : ""}${image ? " has-image" : ""}`}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={(event) => {
                        if (
                            !(event.relatedTarget instanceof Node) ||
                            !event.currentTarget.contains(event.relatedTarget)
                        ) {
                            setDragging(false);
                        }
                    }}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                        <img
                            className="image-check-preview"
                            src={previewUrl}
                            alt="Selected opportunity"
                        />
                    ) : (
                        <span className="image-upload-icon">↑</span>
                    )}

                    <h2>{image ? image.name : "Drop an image here"}</h2>

                    <p>
                        {image
                            ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                            : "Upload an internship or hackathon poster."}
                    </p>

                    <button
                        type="button"
                        className="image-browse-button"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Browse images
                    </button>
                </div>

                <div className="image-check-actions">
                    {image && (
                        <button
                            className="image-remove-button"
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={loading}
                        >
                            Remove image
                        </button>
                    )}

                    <button
                        className="image-check-submit"
                        type="button"
                        disabled={!image || loading}
                        onClick={handleScan}
                    >
                        {loading ? "Analysing image..." : "Scan image"}
                    </button>
                </div>

                {error && (
                    <p className="image-check-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p role="status">{success}</p>
                )}

                {result && (
                    <div className="scan-edit-result">
                        <h2>Extracted opportunity details</h2>
                        <p>
                            Review and correct these details before saving.
                        </p>

                        <div className="scan-edit-field">
                            <label>Opportunity type</label>
                            <select
                                value={result.opportunity_type}
                                onChange={(event) =>
                                    updateField(
                                        "opportunity_type",
                                        event.target.value
                                    )
                                }
                            >
                                <option value="unknown">Select type</option>
                                <option value="internship">Internship</option>
                                <option value="hackathon">Hackathon</option>
                            </select>
                        </div>

                        {renderField("Title", "title")}
                        {renderField("Organisation", "organisation")}
                        {renderField("Location", "location")}
                        {renderField("Description", "description")}

                        {result.opportunity_type === "internship" && (
                            <>
                                {renderField("Skills", "skills")}
                                {renderField("Stipend", "stipend")}
                                {renderField(
                                    "Internship type",
                                    "internship_type"
                                )}
                                {renderField("Deadline", "deadline", "date")}
                            </>
                        )}

                        {result.opportunity_type === "hackathon" && (
                            <>
                                {renderField("Country", "country")}
                                {renderField("Themes", "themes")}
                                {renderField("Event type", "event_type")}
                                <div className="scan-edit-field">
                                    <label>Participation mode</label>
                                    <select
                                        value={result.participation_mode ?? "online"}
                                        onChange={(event) =>
                                            updateField(
                                                "participation_mode",
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                {renderField(
                                    "Registration deadline",
                                    "registration_deadline",
                                    "date"
                                )}
                                {renderField("Start date", "start_date", "date")}
                                {renderField("End date", "end_date", "date")}
                            </>
                        )}

                        {renderField("Application URL", "application_url")}

                        {result.qr_code_content && (
                            <div className="scan-edit-field">
                                <label>QR code content</label>
                                <input
                                    value={result.qr_code_content}
                                    onChange={(event) =>
                                        updateField(
                                            "qr_code_content",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        )}

                        {result.missing_fields?.length > 0 && (
                            <p>
                                Missing information:{" "}
                                {result.missing_fields.join(", ")}
                            </p>
                        )}

                        {result.notes && <p>{result.notes}</p>}

                        <button
                            className="image-check-submit"
                            type="button"
                            disabled={saving}
                            onClick={handleSave}
                        >
                            {saving ? "Saving..." : "Save opportunity"}
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
}

export default Verify;
