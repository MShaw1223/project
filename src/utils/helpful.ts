import { FormEvent } from "react";

type HandlerProps = {
  handler: (e: FormEvent<HTMLFormElement>) => Promise<void>;
};

type MenuProps = {
  li: string;
  isActive: (x: string) => boolean;
};

type DropdownProps = {
  onPairChange: (pair: string) => void;
};

export type { MenuProps, HandlerProps, DropdownProps };
