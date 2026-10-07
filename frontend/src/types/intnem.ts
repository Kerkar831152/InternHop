export interface IntnemMessage {
  id: number;
  sender: "user" | "intnem";
  text: string;
}

export interface IntnemPrompt {
  title: string;
  description: string;
  icon: string;
  message: string;
}