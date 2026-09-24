import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import { ResendConfirmationButton } from "@/components/auth/ResendConfirmationButton";
import { HandlerProps } from "@/utils/helpful";

interface LoginProps extends HandlerProps {
  error?: string | null;
  notice?: string | null;
  // set when the login failed because this address still needs confirming, offers a new link
  unconfirmedEmail?: string | null;
}

export const LoginForm = ({ handler, error, notice, unconfirmedEmail }: LoginProps) => (
  <AuthLayout
    title="Welcome back"
    description="Log in to your FXTrax journal."
    footer={
      <>
        No account?{" "}
        <Link href="/signUp" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </>
    }
  >
    <form onSubmit={handler} className="space-y-4">
      {notice && <FormSuccess message={notice} />}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>
      {error && <FormError message={error} />}
      {unconfirmedEmail && <ResendConfirmationButton email={unconfirmedEmail} />}
      <Button type="submit" className="w-full">
        Log in
      </Button>
    </form>
  </AuthLayout>
);
