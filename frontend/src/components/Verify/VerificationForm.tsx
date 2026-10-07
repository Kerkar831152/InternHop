import { useRef } from "react";

import type { ChangeEvent } from "react";

import type { VerificationFormProps } from "../../types/verification";

function VerificationForm({
  url,
  onUrlChange,
  image,
  onImageChange,
  onVerify,
}: VerificationFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    onImageChange(file);
  };

  return (
    <div className="verification-form">
      <div className="verification-input-group">
        <label>Opportunity URL</label>

        <div className="url-input">
          <span>↗</span>

          <input
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="Paste an internship or hackathon URL..."
          />
        </div>
      </div>

      <div className="verify-divider">
        <span>OR</span>
      </div>

      <div className="upload-zone">
        <div className="upload-icon">▧</div>

        <strong>
          {image ? image.name : "Upload a screenshot"}
        </strong>

        <p>
          Upload a poster, LinkedIn post, or opportunity listing.
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          Choose image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </div>

      <button className="verify-button" onClick={onVerify}>
        <span>✦</span>
        Analyze opportunity
        <span>→</span>
      </button>
    </div>
  );
}

export default VerificationForm;