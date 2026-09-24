import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResendConfirmationButton } from "@/components/auth/ResendConfirmationButton";

// shown after signing up when Supabase needs the user to confirm their email before they can log in
export function CheckEmail({ email }: { email: string }) {
  return (
    <AuthLayout
      title="Check your email"
      description="Confirm your email address to finish creating your account."
      footer="Didn't get it? Check your spam folder, it can take a few minutes to arrive, or resend it above."
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-md border bg-muted/50 p-4" role="status">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Open it to confirm your
            account, then log in.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">Go to log in</Link>
          </Button>
          <ResendConfirmationButton email={email} />
        </div>
      </div>
    </AuthLayout>
  );
}
