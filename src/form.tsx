import { invoke } from "@tauri-apps/api/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface FormData {
  name: string;
}

export function PlaneForm() {
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  async function save_form_data(formData: FormData) {
    await invoke("save_json_file", { formData: formData })
      .then((filePath) => console.log(`File saved to: ${filePath}`))
      .catch((error) => console.error(`Error saving file: ${error}`));
  }

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await save_form_data(data);
      console.log("Form submitted:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="name..." {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit">Create Json File</Button>
      </form>
    </Form>
  );
}
