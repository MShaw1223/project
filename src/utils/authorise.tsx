import { useRouter } from "next/router";
import { useEffect } from "react";

function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
      }
    }, []);

    return <Component {...props} />;
  };
}

export default withAuth;
