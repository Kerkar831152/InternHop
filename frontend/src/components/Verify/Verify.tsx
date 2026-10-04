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
    if (!url.trim() && !image) {
      return;
    }

    setResult({
      confidence: 82,
      status: "review",
      summary: "This opportunity looks mostly legitimate.",
      checks: [
        {
          label: "Source found",
          status: "passed",
          message:
            "The opportunity source could be identified.",
        },
        {
          label: "Organizer information",
          status: "passed",
          message:
            "Organizer information appears consistent.",
        },
        {
          label: "Deadline",
          status: "warning",
          message:
            "The listed deadline could not be independently confirmed.",
        },
        {
          label: "Registration link",
          status: "warning",
          message:
            "The registration destination requires further review.",
        },
      ],
    });
  };

  return (
    <section className="verify-section" id="verify">
      <div className="verify-heading">
        <span className="section-label">
          TRUST BEFORE YOU APPLY
        </span>

        <h2>Verify an opportunity.</h2>

        <p>
          Found an internship or hackathon somewhere else?
          Let Intnem check the available evidence before you
          apply.
        </p>
      </div>

      <div className="verify-container">
        <VerificationForm
          url={url}
          onUrlChange={setUrl}
          image={image}
          onImageChange={setImage}
          onVerify={handleVerify}
        />

        {result && (
          <VerificationResult result={result} />
        )}
      </div>
    </section>
  );
}

export default Verify;