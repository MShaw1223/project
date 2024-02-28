import { Button } from "@/components/ui/button";
import React, { FormEvent } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// TODO:
// -Use the userFromHash api
// -API (reference delAcc.ts), delete user sql: delete from tableusers where accountname = ?

export default function DeleteUser() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Form submission works");
  }

  return (
    <>
      <div className="p-3 m-1 font-bold">
        <span>REDOING THIS</span>
        <form onSubmit={handleSubmit}>
          <h1>Just click the button to test the form</h1>
          <Button type="submit">Click Me</Button>
        </form>
      </div>
    </>
  );
}
