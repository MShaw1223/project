import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";

function withAuth(Component: ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      const { li } = router.query;
      const loggedIn = li;
      if (!loggedIn) {
        router.push("/");
      }
    }, []);

    return <Component {...props} />;
  };
}

export default withAuth;
