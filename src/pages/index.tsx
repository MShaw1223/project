import { NextPage } from "next";
import Link from "next/link";

const LogIn: NextPage = () => {
  //buff out and style --> also have the other pages set up
  //test if db works with different layout 
  //I have moved index over to trade entry, and coded below as the new entry page
  //Use react-icons to style icons for home screen / index (below)
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center font-medium text-2xl mt-56 p-3">Login page will be here soon...</h1>
      <div className="p-1 outline-dashed outline-1">
        <Link href="/home"> <strong>Home Page</strong></Link>
      </div>
    </div>
  )
}

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