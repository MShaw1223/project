import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  delete_entry_form_schema,
  delete_entry_onSubmit,
} from "./entryMngmtTabs";

export default function DeleteEntry() {
  const delete_form = useForm<z.infer<typeof delete_entry_form_schema>>({
    resolver: zodResolver(delete_entry_form_schema),
    defaultValues: {
      tradesID: "",
    },
  });
  return (
    <div className="flex items-center justify-center">
      <Form {...delete_form}>
        <form onSubmit={delete_form.handleSubmit(delete_entry_onSubmit)}>
          <FormLabel className="font-bold text-lg">Delete Entry</FormLabel>
          <div className="p-2">
            <FormField
              control={delete_form.control}
              name="tradesID"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Trades ID....." {...field} />
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
