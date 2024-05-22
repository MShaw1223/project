import { useRouter } from "next/router";
import { OpenView, CollapsedView } from "./views";
import { useState } from "react";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isLinkActive = (href: string) => router.pathname === href;
  const { li } = router.query;
  const liParam = li as string;

  return (
    <>
      {isOpen ? (
        // open
        <OpenView
          li={liParam}
          isActive={isLinkActive}
          setOpen={setIsOpen}
          isOpen={isOpen}
        />
      ) : (
        // collapsed
        <CollapsedView
          li={liParam}
          isActive={isLinkActive}
          setOpen={setIsOpen}
          isOpen={isOpen}
        />
      )}
    </>
  );
};

export default Menu;
