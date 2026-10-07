import { useState } from "react";

import VerificationForm from "./VerificationForm";
import VerificationResult from "./VerificationResult";

import type { VerificationResult as VerificationResultType } from "../../types/verification";

function Verify() {
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] =
    useState<VerificationResultType | null>(null);

  const handleVerify = () => {
    setResult({
      confidence: 87,
      status: "review",
      summary:
        "The opportunity has several positive signals, but some details should be checked before applying.",
      checks: [
        {
          label: "Opportunity source",
          status: "passed",
          message:
            "The source appears to contain identifiable organization information.",
        },
        {
          label: "Application process",
          status: "passed",
          message:
            "No obvious unusual payment requirement was detected.",
        },
        {
          label: "Contact information",
          status: "warning",
          message:
            "Some contact details could not be independently confirmed.",
        },
        {
          label: "Overall consistency",
          status: "passed",
          message:
            "The opportunity details are mostly consistent with the provided listing.",
        },
      ],
    });
  };

  return (
    <section className="section verify-section" id="verify">
      <div className="section-container">
        <div className="verify-layout">
          <div className="verify-copy">
            <span className="section-label">OPPORTUNITY VERIFY</span>

            <h2>
              Not sure if it's
              <span> worth trusting?</span>
            </h2>

            <p>
              Found an internship or hackathon somewhere else?
              Send it to InternHop. Intnem can analyze the available
              information and highlight signals that deserve
              attention.
            </p>

            <div className="verify-flow">
              <div className="flow-item">
                <span>01</span>
                <div>
                  <strong>Submit</strong>
                  <p>URL or screenshot</p>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>02</span>
                <div>
                  <strong>Analyze</strong>
                  <p>Evidence and signals</p>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>03</span>
                <div>
                  <strong>Understand</strong>
                  <p>Confidence and warnings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="verify-panel">
            {!result ? (
              <VerificationForm
                url={url}
                onUrlChange={setUrl}
                image={image}
                onImageChange={setImage}
                onVerify={handleVerify}
              />
            ) : (
              <VerificationResult result={result} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Verify;