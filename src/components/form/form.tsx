import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema, type FormData } from "@/components/form/schema";
import {
  SwitchTypeField,
  SwitchNameField,
  SwitchDescriptionField,
  MovementModeField,
  MovementAxisField,
  UpperLimitField,
  LowerLimitField,
  BleedMarginsField,
  MomentarySwitchField,
  DefaultPositionField,
} from "@/components/form/fields";
import useCreateNewSwitch from "@/hooks/mutations/useCreateNewSwitch";

export function PlaneForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      switchType: undefined,
      movementAxis: undefined,
      switchName: "",
      switchDescription: "",
      movementMode: false,
      momentarySwitch: false,
      defaultPosition: undefined,
      upperLimit: undefined,
      lowerLimit: undefined,
      bleedMargins: undefined,
    },
  });

  const isMomentary = form.watch("momentarySwitch");
  const { mutate: createNewSwitch, isPending } = useCreateNewSwitch();

  const onSubmit = async (data: FormData) => {
    try {
      let validatedData = formSchema.parse(data);

      if (
        !validatedData.momentarySwitch &&
        validatedData.defaultPosition === undefined
      ) {
        validatedData = { ...validatedData, defaultPosition: 0 };
      }

      createNewSwitch(validatedData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-6 bg-card text-card-foreground shadow rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwitchNameField control={form.control} />
            <SwitchTypeField control={form.control} />
          </div>
          <SwitchDescriptionField control={form.control} />

          <MovementModeField control={form.control} />
          <MovementAxisField control={form.control} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UpperLimitField control={form.control} />
            <LowerLimitField control={form.control} />
            <BleedMarginsField control={form.control} />
          </div>
          <MomentarySwitchField control={form.control} />
          <div
            className={`transition-all duration-300 ease-in-out ${
              isMomentary
                ? "max-h-20 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <DefaultPositionField control={form.control} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create JSON File"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
