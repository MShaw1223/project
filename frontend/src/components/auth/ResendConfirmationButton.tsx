import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { resendConfirmation } from "@/lib/auth";
import { ApiError } from "@/lib/api";

// Supabase refuses a resend to the same address within about a minute, so the button waits that long
export const RESEND_COOLDOWN_SECONDS = 60;

// 45 -> "45s", 125 -> "2:05"
function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function resendErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Unable to reach the server. Please try again.";
  if (error.status === 429) return "Too many emails were requested. Wait a little and try again.";
  return "Couldn't resend the email. Please try again.";
}

export function ResendConfirmationButton({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(0);
  const mutation = useMutation({
    mutationFn: () => resendConfirmation(email),
    onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
    onError: (error) => {
      // the backend's own limit sends Retry-After, Supabase's per-address limit doesn't
      if (error instanceof ApiError && error.status === 429) {
        setCooldown(Math.ceil(error.retryAfter ?? RESEND_COOLDOWN_SECONDS));
      }
    },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || cooldown > 0}
      >
        {mutation.isPending ? <Loader2 className="animate-spin" /> : <RotateCw />}
        {cooldown > 0 ? `Resend confirmation email (${formatWait(cooldown)})` : "Resend confirmation email"}
      </Button>
      {mutation.isSuccess && <FormSuccess message={`We sent a new confirmation link to ${email}.`} />}
      {mutation.isError && <FormError message={resendErrorMessage(mutation.error)} />}
    </div>
  );
}
