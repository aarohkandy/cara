export type Project = {
  id: string;
  name: string;
  shortName: string;
  kind: string;
  status: string;
  prompt: string;
  updated: string;
  color: string;
  accent: string;
  score: number;
  parts: number;
  dimensions: string;
};

export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};
