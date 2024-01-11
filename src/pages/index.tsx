import { NextPage } from "next";
import Link from "next/link";
import Login from "@/utils/LoginPage";

const LogIn: NextPage = () => {
  //buff out and style --> also have the other pages set up
  //test if db works with different layout
  //I have moved index over to trade entry, and coded below as the new entry page
  //Use react-icons to style icons for home screen / index (below)
  return (
    <>
      <div className="flex h-screen bg-slate-600">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex ml-20 mt-20 mb-24 text-3xl">
            <span className="my-auto ml-20">Welcome To FXTrax...</span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-3xl">
            <Login />
            <Link href="/home">
              <strong>Press Me:</strong> To Home Page
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
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
