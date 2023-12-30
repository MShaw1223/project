import { NextPage } from "next";
import Link from "next/link";
import Login from "@/components/ui/LoginPage";
const LogIn: NextPage = () => {
  //buff out and style --> also have the other pages set up
  //test if db works with different layout
  //I have moved index over to trade entry, and coded below as the new entry page
  //Use react-icons to style icons for home screen / index (below)
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <span className="my-auto font-sans font-bold">Welcome...</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center text-3xl">
          <Login />
          <Link href="/home">
            <strong>Press Me:</strong> Straight to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
//<FaHome className="h-10 w-10"></FaHome>
/*
use this for on success - of logging so ie user is valid - send thru to homepage
onSuccess: (data) => {
  const a = data; const b = data; const c = data;
  const composite = `/${a}/${b}/${c}`;
  router.push(composite);
} this is useful to redirect to a new url after a 
process is successfully carried out. If its many things to move thru then use a composite for router.push()
Else just use the router.push(`${xyzabc}`)
*/
