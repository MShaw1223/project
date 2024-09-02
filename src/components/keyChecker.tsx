import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";

function withKey(Component: ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      const getLi = async () => {
        const { li: loggedInVal } = router.query;
        if (typeof loggedInVal !== "string") {
          router.push("/");
        }
      };
      getLi();
    }, []);

    return <Component {...props} />;
  };
}

export default withKey;
