import { z } from "zod";
import { TRADE_DIRECTIONS } from "@/lib/trades";

// mirrors the limits the Go services enforce (backend/services/*.go), the backend stays the authority
export const LIMITS = {
  emailMax: 254,
  passwordMin: 6,
  passwordMax: 72,
  accountNameMax: 15,
  usernameMax: 20,
  notesMax: 1000,
} as const;

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
const CURRENCY_PAIR_PATTERN = /^[A-Z]{3,10}$/;

const passwordMessage = `Password must be between ${LIMITS.passwordMin} and ${LIMITS.passwordMax} characters`;
const password = z.string({ required_error: passwordMessage }).min(LIMITS.passwordMin, passwordMessage).max(LIMITS.passwordMax, passwordMessage);

export const credentialsSchema = z.object({
  email: z.string({ required_error: "Enter a valid email address" }).trim().email("Enter a valid email address").max(LIMITS.emailMax),
  password,
});

export const signupSchema = credentialsSchema
  .extend({ confirmPassword: z.string().optional() })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match" });

export const changePasswordSchema = z
  .object({ password, confirmPassword: z.string().optional() })
  .refine((data) => data.password === data.confirmPassword, { message: "Entries do not match" });

export const accountNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name for the account")
    .max(LIMITS.accountNameMax, `Use at most ${LIMITS.accountNameMax} characters`),
});

export const usernameSchema = z.object({
  username: z.string().trim().regex(USERNAME_PATTERN, "Use 3-20 letters, numbers or underscores"),
});

export const currencyPairSchema = z.object({
  symbol: z.string().trim().toUpperCase().regex(CURRENCY_PAIR_PATTERN, "Enter 3-10 letters, e.g. EURUSD"),
});

// "" or missing becomes undefined so the field reports as required, anything else goes through Number()
const numberField = (message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : undefined),
    z.number({ required_error: message, invalid_type_error: message }).positive(message)
  );

const priceMessage = "Entry and close price must both be greater than 0";

// field names match the backend's TradeRequest so the parsed value is the request body
export const newTradeSchema = z
  .object({
    account_id: z.string().min(1, "Select the account for this trade"),
    currency_pair: z.string().regex(CURRENCY_PAIR_PATTERN, "Select or add a currency pair"),
    direction: z.enum(TRADE_DIRECTIONS, { errorMap: () => ({ message: "Choose whether the trade was long or short" }) }),
    entry_price: numberField(priceMessage),
    exit_price: numberField(priceMessage),
    stop_loss: z.preprocess(
      (value) => (typeof value === "string" && value.trim() !== "" ? value : null),
      numberField("Stop loss must be greater than 0, or left empty").nullable()
    ),
    notes: z.string().max(LIMITS.notesMax, `Notes must be at most ${LIMITS.notesMax} characters`).default(""),
  })
  .superRefine((trade, ctx) => {
    if (trade.stop_loss === null) return;
    const long = trade.direction === "long";
    if (long ? trade.stop_loss >= trade.entry_price : trade.stop_loss <= trade.entry_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: long
          ? "For a long trade the stop loss must be below the entry price"
          : "For a short trade the stop loss must be above the entry price",
      });
    }
  });

export type ParseResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

// validates a form's fields (plus values held in component state) and reports the first problem
export function parseForm<S extends z.ZodTypeAny>(
  schema: S,
  form: HTMLFormElement,
  extra: Record<string, unknown> = {}
): ParseResult<z.output<S>> {
  const result = schema.safeParse({ ...Object.fromEntries(new FormData(form)), ...extra });
  return result.success ? { data: result.data } : { error: result.error.issues[0].message };
}
