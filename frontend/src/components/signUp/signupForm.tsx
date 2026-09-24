import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormError } from "@/components/FormFeedback";
import { HandlerProps } from "@/utils/helpful";

interface SignupProps extends HandlerProps {
  error?: string | null;
}

export const SignupForm = ({ handler, error }: SignupProps) => (
  <AuthLayout
    title="Create an account"
    description="Start journaling your trades with FXTrax."
    footer={
      <>
        Already have an account?{" "}
        <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </>
    }
  >
    <form onSubmit={handler} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstPassword">Password</Label>
        <PasswordInput id="firstPassword" name="firstPassword" autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
      </div>
      {error && <FormError message={error} />}
      <Button type="submit" className="w-full">
        Sign up
      </Button>
    </form>
  </AuthLayout>
);
