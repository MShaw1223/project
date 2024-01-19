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

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

function onSubmit(values: z.infer<typeof formSchema>) {
  // Do something with the form values --> neon
  // Type-safe and validated.
  console.log(values);
}

export default function UserCreate() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormLabel className="font-bold text-lg">New User</FormLabel>
          <div className="p-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Username....." {...field} />
                  </FormControl>
                  <FormDescription>User must be min. 2 chars</FormDescription>
                  <FormMessage />
                </FormItem> //send username to db
              )}
            />
          </div>
          <div className="p-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Password....." {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must be min. 8 chars
                  </FormDescription>
                  <FormMessage />
                </FormItem> //send this to db?
              )}
            />
          </div>
          <div className="p-4">
            <Button type="submit" className="w-full">
              New User
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
