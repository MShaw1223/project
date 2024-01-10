//TREAT THIS AS A ROUGH TODOLIST
import * as z from "zod";

//EDIT ENTRY
const edit_entry_form_schema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

function edit_entry_onSubmit(values: z.infer<typeof edit_entry_form_schema>) {
  // Do something with the form values --> neon
  // Type-safe and validated.
  console.log(values);
}

//DELETE ENTRY
const delete_entry_form_schema = z.object({
  tradesID: z.string().min(2, {
    message: "ID must be at least 2 digits.",
  }),
});

function delete_entry_onSubmit(
  values: z.infer<typeof delete_entry_form_schema>
) {
  // Do something with the form values --> neon
  // Type-safe and validated.
  console.log(values);
}

//NEW CURRENCY

export {
  edit_entry_form_schema,
  edit_entry_onSubmit,
  delete_entry_form_schema,
  delete_entry_onSubmit,
};
