export interface InputValue<T = unknown> {
  input: string;
  value: T;
  valid: false;
}

export type Location = "source" | "target";
