import { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  //buff out and style --> also have the other pages set up
  //test if db works with different layout 
  //I have moved index over to trade entry, and coded below as the new entry page
  //Use react-icons to style icons for home screen / index (below)
  return (
    <div className="text-center h-screen bg-slate-50 mx-auto my-auto">
        <h1 className="text-4xl font-black p-8">
          Trade Application
        </h1>
        <h1 className="text-2xl font-black p-2">To entry Page</h1>
        <div className="w-full bg-slate-200">
            <Link href="/Trade-Entry" > Trade Entry </Link>
        </div>
        
        <h1 className="text-2xl font-black p-2">To other Page</h1>
        <div className="w-full bg-slate-200">
            <Link href="/Trade-Entry" >xx</Link>
        </div>
        
        <h1 className="text-2xl font-black p-2">To xyz Page</h1>
        <div className="w-full bg-slate-200">
            <Link href="/Trade-Entry" >xx</Link>
        </div>
        
        <h1 className="text-2xl font-black p-2">To abc Page</h1>
        <div className="w-full bg-slate-200">
            <Link href="/Trade-Entry" >xx</Link>
        </div>
    </div>
  )
}

export default Home;
/*
this wouldd be the other approach 
onSuccess: (data) => {
  const a = data; const b = data; const c = data;
  const composite = `/${a}/${b}/${c}`;
  router.push(composite);
} this is useful to redirect to a new url after a 
process is successfully carried out. If its many things to move thru then use a composite for router.push()
Else just use the router.push(`${xyzabc}`)
*/