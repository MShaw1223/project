import { useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import { resendConfirmation } from "@/lib/auth";

// Supabase refuses a resend to the same address within about a minute, so the button waits that long
export const RESEND_COOLDOWN_SECONDS = 60;

type Result = { kind: "sent" } | { kind: "error"; message: string } | null;

// the backend's own limit sends Retry-After in seconds, Supabase's per-address limit doesn't
function retryAfterSeconds(response: Response): number {
  const seconds = Number(response.headers.get("Retry-After"));
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : RESEND_COOLDOWN_SECONDS;
}

// 45 -> "45s", 125 -> "2:05"
function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ResendConfirmationButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<Result>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleClick() {
    setSending(true);
    setResult(null);
    try {
      const response = await resendConfirmation(email);
      if (response.ok) {
        setResult({ kind: "sent" });
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (response.status === 429) {
        setResult({ kind: "error", message: "Too many emails were requested. Wait a little and try again." });
        setCooldown(retryAfterSeconds(response));
      } else {
        setResult({ kind: "error", message: "Couldn't resend the email. Please try again." });
      }
    } catch {
      setResult({ kind: "error", message: "Unable to reach the server. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={sending || cooldown > 0}
      >
        {sending ? <Loader2 className="animate-spin" /> : <RotateCw />}
        {cooldown > 0 ? `Resend confirmation email (${formatWait(cooldown)})` : "Resend confirmation email"}
      </Button>
      {result?.kind === "sent" && <FormSuccess message={`We sent a new confirmation link to ${email}.`} />}
      {result?.kind === "error" && <FormError message={result.message} />}
    </div>
  );
}
