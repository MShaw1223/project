import { ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BackendUser, getCurrentUser } from "@/lib/auth";

export type SessionProps = {
  user: BackendUser;
};

// guards a page behind the Go backend's httpOnly session cookie and hands the resolved user to it
function withSession(Component: ComponentType<SessionProps>) {
  return function SessionComponent() {
    const router = useRouter();
    const [user, setUser] = useState<BackendUser | null>(null);

    useEffect(() => {
      let cancelled = false;
      getCurrentUser()
        .catch(() => null)
        .then((current) => {
          if (cancelled) return;
          if (current === null) router.replace("/");
          else setUser(current);
        });
      return () => {
        cancelled = true;
      };
      // router.replace is stable enough here, re-running on every route change would refetch the user
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return user === null ? null : <Component user={user} />;
  };
}

export default withSession;
