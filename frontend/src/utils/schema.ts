import zod, { number } from "zod";

const deleteAccountSchema = zod.object({
  accountname: zod.string().max(15, {
    message: "Account name must be less than 15 characters",
  }),
});
const deleteEntrySchema = zod.object({
  tradesid: zod.number().min(1, {
    message: "ID must be at least 1 digit.",
  }),
  accountid: zod.number().min(1, { message: "ID must be at least 1 digit." }),
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
  accountID: zod.number(),
});
const newAccountSchema = zod.object({
  accountname: zod.string().max(15),
  userid: zod.number(),
});
const newCurrencySchema = zod.object({
  pairabbr: zod.string().max(5),
  userid: zod.number(),
});
const userPwdSchema = zod.object({
  username: zod.string().max(60),
  passwd: zod.string().max(15),
});
const lginSignUpSchema = zod.object({
  passwd: zod.string().max(60),
  username: zod.string().max(15),
});

export {
  deleteAccountSchema,
  deleteEntrySchema,
  entries_schema,
  newAccountSchema,
  newCurrencySchema,
  userPwdSchema,
  lginSignUpSchema,
};
