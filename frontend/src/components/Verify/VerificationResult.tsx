import type { VerificationResultProps } from "../../types/verification";

function VerificationResult({
  result,
}: VerificationResultProps) {
  return (
    <div className="verification-result">
      <div className="verification-result-header">
        <div>
          <span className="section-label">
            VERIFICATION RESULT
          </span>

          <h3>{result.summary}</h3>
        </div>

        <div
          className={`confidence confidence-${result.status}`}
        >
          {result.confidence}%
          <span>confidence</span>
        </div>
      </div>

      <div className="verification-checks">
        {result.checks.map((check) => (
          <div
            key={check.label}
            className={`verification-check check-${check.status}`}
          >
            <div className="check-icon">
              {check.status === "passed"
                ? "✓"
                : check.status === "warning"
                ? "!"
                : "×"}
            </div>

            <div>
              <strong>{check.label}</strong>
              <p>{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="evidence-btn">
        View evidence
      </button>
    </div>
  );
}

export default VerificationResult;