import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

function Verify() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const [showUnavailableResult, setShowUnavailableResult] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function selectImage(file: File | undefined) {
        setError("");
        setShowUnavailableResult(false);

        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setImage(null);
            setPreviewUrl("");
            setError("Choose an image file to preview.");
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

    function handleCheckImage() {
        if (image) setShowUnavailableResult(true);
    }

    function handleRemoveImage() {
        setImage(null);
        setPreviewUrl("");
        setError("");
        setShowUnavailableResult(false);
    }

    return (
        <section className="image-check-page">
            <header className="image-check-header">
                <span className="image-check-eyebrow">OPPORTUNITY SAFETY</span>
                <h1>Check an opportunity image</h1>
                <p>
                    Review an internship, hackathon, or opportunity image before
                    taking action. The checker will only report what it can
                    support with evidence.
                </p>
            </header>

            <section className="image-check-panel" aria-label="Image legitimacy checker">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Choose an image to check"
                    hidden
                />
                {!showUnavailableResult ? (
                    <>
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
                                    alt={`Preview of ${image?.name ?? "selected image"}`}
                                />
                            ) : (
                                <span className="image-upload-icon" aria-hidden="true">
                                    ↑
                                </span>
                            )}
                            <h2>{image ? image.name : "Drop an image here"}</h2>
                            <p>
                                {image
                                    ? `${(image.size / 1024 / 1024).toFixed(2)} MB · Preview stays on this device`
                                    : "Choose an image from your device or drag it into this area."}
                            </p>
                            <button
                                className="image-browse-button"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Browse images
                            </button>
                        </div>

                        <p className="image-check-guidance">
                            Browser-supported image files can be previewed. The
                            project does not currently provide a verification
                            endpoint or publish upload size limits. Your image is
                            not uploaded.
                        </p>

                        {error && <p className="image-check-error" role="alert">{error}</p>}

                        <div className="image-check-actions">
                            {image && (
                                <button
                                    className="image-remove-button"
                                    type="button"
                                    onClick={handleRemoveImage}
                                >
                                    Remove image
                                </button>
                            )}
                            <button
                                className="image-check-submit"
                                type="button"
                                disabled={!image}
                                onClick={handleCheckImage}
                            >
                                Check image
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="image-check-result" role="status">
                        <span className="image-result-status">Unable to verify</span>
                        <h2>No analysis was performed</h2>
                        <p>
                            InternHop does not currently have a connected image
                            verification service. This image has not been
                            evaluated, and we cannot determine whether its claims
                            are genuine.
                        </p>
                        <button
                            className="image-browse-button"
                            type="button"
                            onClick={() => {
                                setImage(null);
                                setPreviewUrl("");
                                setError("");
                                setShowUnavailableResult(false);
                                fileInputRef.current?.click();
                            }}
                        >
                            Choose another image
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
}

export default Verify;
