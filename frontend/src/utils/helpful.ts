import { FormEvent } from "react";

type HandlerProps = {
  handler: (e: FormEvent<HTMLFormElement>) => Promise<void>;
};

export type { HandlerProps };
