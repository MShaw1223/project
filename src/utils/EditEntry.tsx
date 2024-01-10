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
import { edit_entry_form_schema, edit_entry_onSubmit } from "./entryMngmtTabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const EditEntry = () => {
  const editEntry_form = useForm<z.infer<typeof edit_entry_form_schema>>({
    resolver: zodResolver(edit_entry_form_schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  return (
    <div className="flex items-center justify-center">
      <Form {...editEntry_form}>
        <form onSubmit={editEntry_form.handleSubmit(edit_entry_onSubmit)}>
          <FormLabel className="font-bold text-lg">Edit Entry</FormLabel>
          <div className="p-2">
            <FormField
              control={editEntry_form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Username....." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="p-2">
            <FormField
              control={editEntry_form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Password....." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter Password to make changes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="p-4">
            <Button type="submit" className="w-full">
              Submit Change
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default EditEntry;
