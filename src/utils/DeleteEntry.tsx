import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface DUinterface {
  entryID: string;
}

//interface finds user and shows a pop-up to edit
//shadcn has a really nice pop-up for this
const formSchema = z.object({
  entryID: z.string().min(2, {
    message: "ID must be at least 2 digits.",
  }),
});

function onSubmit(values: z.infer<typeof formSchema>) {
  // Do something with the form values --> neon
  // Type-safe and validated.
  console.log(values);
}

export default function DeleteEntry() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryID: "",
    },
  });
  return (
    <div className="flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormLabel className="font-bold text-lg">Delete Entry</FormLabel>
          <div className="p-2">
            <FormField
              control={form.control}
              name="entryID"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="EntryID....." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="p-4">
            <Button type="submit" className="w-full">
              Delete
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
