import type { VerificationFormProps } from "../../types/verification";

function VerificationForm({
  url,
  onUrlChange,
  image,
  onImageChange,
  onVerify,
}: VerificationFormProps) {
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="verification-form">
      <div className="verification-url">
        <span>🔗</span>

        <input
          type="text"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="Paste an opportunity URL..."
        />
      </div>

      <div className="verification-divider">
        <span>OR</span>
      </div>

      <label className="verification-upload">
        <span className="verification-upload-icon">↑</span>

        <span>
          {image ? image.name : "Upload a screenshot"}
        </span>

        <small>
          PNG, JPG or WEBP
        </small>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </label>

      {image && (
        <button
          className="verification-remove"
          onClick={() => onImageChange(null)}
        >
          Remove screenshot
        </button>
      )}

      <button
        className="verify-btn"
        onClick={onVerify}
        disabled={!url.trim() && !image}
      >
        Verify opportunity
      </button>
    </div>
  );
}

export default VerificationForm;