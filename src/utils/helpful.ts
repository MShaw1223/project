import { FormEvent } from "react";

export interface LoginSignupProps {
  handler: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}
