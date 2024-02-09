import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";

function withAuth(Component: ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      }
    }, []);

    return <Component {...props} />;
  };
}

export default withAuth;
