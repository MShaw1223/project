import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent } from "react";

//interface finds user and shows a pop-up to edit
//shadcn has a really nice pop-up for this
// put is correct http req for this look at how they work

const EditUser = () => {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Handle Submit works");
  }
  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <h1 className="font-bold text-lg">Edit User</h1>
        {/* 
        //todo: dropdown of input or password to change (both varchar), 
        if user changes then have a different api called (same file) that will redo the hash for li
        
        */}
        <h3>temp: click button</h3>
        {/* <div className="p-2">
          <Input placeholder="Username....." />
        </div>
        <div className="p-2">
          <Input placeholder="Password....." />
        </div> */}
        <div className="p-4">
          <Button type="submit" className="w-full">
            Submit Change
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditUser;
