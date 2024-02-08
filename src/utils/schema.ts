import zod, { number } from "zod";

const usernameAndPassword = zod.object({
  username: zod.string().max(15),
  passwd: zod.string().max(60),
});

const deleteAccountSchema = zod.object({
  accountname: zod.string().max(15, {
    message: "Account name must be less than 15 characters",
  }),
});

const deleteEntrySchema = zod.object({
  tradesid: zod.number().min(1, {
    message: "ID must be at least 1 digits.",
  }),
});

const editEntrySchema = zod.object({
  tradeid: number().min(1),
  pairabbr: zod.string().max(5),
});

const entries_schema = zod.object({
  entryPrice: number()
    .max(9999999.9999999, {
      message: "Entry price must be less than 9999999.9999999",
    })
    .min(0.0000001, {
      message: "Entry price must be greater than 0.0000001",
    }),
  stopLoss: number()
    .max(9999999.9999999, {
      message: "Stop loss must be less than 9999999.9999999",
    })
    .min(0.0000001, {
      message: "Stop loss must be greater than 0.0000001",
    }),
  takeProfit: number()
    .max(9999999.9999999, {
      message: "Take profit must be less than 9999999.9999999",
    })
    .min(0.0000001, {
      message: "Take profit must be greater than 0.0000001",
    }),
  tradeNotes: zod.string().max(1250, {
    message: "Trade notes must be less than 1250 characters",
  }),
  selectedPair: zod.string(),
  riskRatio: number()
    .max(9999.999, {
      message: "Risk ratio must be less than 9999.999",
    })
    .min(0, {
      message: "Risk ratio must be greater than 0",
    }),
  selectedOutcome: zod.string(),
  userID: zod.number(),
  accountID: zod.number(),
});

const newAccountSchema = zod.object({
  accountname: zod.string().max(15),
});

const newCurrencySchema = zod.object({
  pairabbr: zod.string().max(5),
});

export {
  usernameAndPassword,
  deleteAccountSchema,
  deleteEntrySchema,
  editEntrySchema,
  entries_schema,
  newAccountSchema,
  newCurrencySchema,
};
