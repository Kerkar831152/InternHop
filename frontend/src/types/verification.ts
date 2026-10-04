export interface VerificationResult {
  confidence: number;
  status: "verified" | "review" | "suspicious";
  summary: string;
  checks: VerificationCheck[];
}

export interface VerificationCheck {
  label: string;
  status: "passed" | "warning" | "failed";
  message: string;
}

export interface VerificationFormProps {
  url: string;
  onUrlChange: (value: string) => void;
  image: File | null;
  onImageChange: (file: File | null) => void;
  onVerify: () => void;
}

export interface VerificationResultProps {
  result: VerificationResult;
}