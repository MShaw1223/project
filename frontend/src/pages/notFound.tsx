import { Link } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFoundPage() {
  return (
    <>
      <title>FXTrax - Page not found</title>
      <AuthLayout title="Page not found" description="There's nothing at this address.">
        <Button asChild className="w-full">
          <Link to={ROUTES.dashboard}>Back to FXTrax</Link>
        </Button>
      </AuthLayout>
    </>
  );
}
