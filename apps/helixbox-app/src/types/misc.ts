export interface InputValue<T = unknown> {
  input: string;
  value: T;
  valid: boolean;
}

export type Location = "source" | "target";
