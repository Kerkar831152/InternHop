import type { VerificationResultProps } from "../../types/verification";

function VerificationResult({
  result,
}: VerificationResultProps) {
  const statusClass =
    result.status === "verified"
      ? "verified"
      : result.status === "review"
        ? "review"
        : "suspicious";

  return (
    <div className="verification-result">
      <div className="result-header">
        <div>
          <span className="section-label">ANALYSIS COMPLETE</span>

          <h3>Verification result</h3>
        </div>

        <div className={`confidence-circle ${statusClass}`}>
          <strong>{result.confidence}%</strong>
          <span>confidence</span>
        </div>
      </div>

      <div className={`result-status ${statusClass}`}>
        <span>
          {result.status === "verified"
            ? "✓"
            : result.status === "review"
              ? "!"
              : "×"}
        </span>

        <div>
          <strong>
            {result.status === "verified"
              ? "Looks legitimate"
              : result.status === "review"
                ? "Needs a closer look"
                : "Potential warning signs"}
          </strong>

          <p>{result.summary}</p>
        </div>
      </div>

      <div className="verification-checks">
        {result.checks.map((check) => (
          <div className="verification-check" key={check.label}>
            <div
              className={`check-icon ${check.status}`}
            >
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
    </div>
  );
}

export default VerificationResult;