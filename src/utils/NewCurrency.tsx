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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

const NewCurrencyPage = () => {
  const new_currency_form_schema = z.object({
    Abbreviation: z.string().min(3, {
      message: "Abbreviation must be at least 3 characters.",
    }),
    reEnteredAbbreviation: z.string().min(8, {
      message: "reEnteredAbbreviation must be at least 3 characters.",
    }),
  });
  const newCurrency_form = useForm<z.infer<typeof new_currency_form_schema>>({
    resolver: zodResolver(new_currency_form_schema),
    defaultValues: {
      Abbreviation: "",
      reEnteredAbbreviation: "",
    },
  });

  function new_currency_onSubmit(
    values: z.infer<typeof new_currency_form_schema>
  ) {
    if (values.Abbreviation !== values.reEnteredAbbreviation) {
      throw new Error("Entries do not match");
    }
    if (values.Abbreviation === values.reEnteredAbbreviation) {
      //api call newCurrency.ts
    }
    console.log(values);
  }
  return (
    <>
      <div className="flex items-center justify-center">
        <Form {...newCurrency_form}>
          <form onSubmit={newCurrency_form.handleSubmit(new_currency_onSubmit)}>
            <FormLabel className="font-bold text-lg">New Currency</FormLabel>
            <div className="flex flex-row">
              <div className="p-2">
                <FormField
                  control={newCurrency_form.control}
                  name="Abbreviation"
                  render={({ field }) => (
                    <FormItem className="w-[355px]">
                      <FormDescription>
                        Enter the abbreviation of the currency ie GBP
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="New Currency Abbreviation....."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="p-2 pl-5">
                <FormField
                  control={newCurrency_form.control}
                  name="reEnteredAbbreviation"
                  render={({ field }) => (
                    <FormItem className="w-[217px]">
                      <FormDescription>
                        Re-enter the abbreviation
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="Re-enter Abbreviation..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="p-3 text-center">
              <Button type="submit">Submit New</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
export default NewCurrencyPage;
