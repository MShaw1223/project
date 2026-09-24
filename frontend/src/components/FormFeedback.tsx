import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// inline error/success banners shared by every form, errors are announced as alerts and successes as status
export const FormError = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export const FormSuccess = ({ message }: { message: string }) => (
  <Alert variant="success" role="status">
    <CheckCircle2 />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
