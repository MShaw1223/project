import zod from "zod";

// mirrors the limits the Go backend enforces on login and sign up
const credentialsSchema = zod.object({
  email: zod.string().trim().email("Enter a valid email address").max(254),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters"),
});

export { credentialsSchema };
