import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { SwitchItem } from "@/screens/switch_editor/SwitchEditorScreen"; // Adjust the path as needed

interface PlaneFormProps {
  selectedSwitch: SwitchItem | null;
}

export function PlaneForm({ selectedSwitch }: PlaneFormProps) {
  // Fetch the current configuration data (which includes switch-specific configs)
  const { data: planeData } = useGetSelectedConfigData();

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

  // Prepopulate or reset the form values when a switch is selected.
  // For switchType we always use the value extracted from the switch's tag.
  useEffect(() => {
    if (selectedSwitch) {
      const existingConfig = planeData?.switches[selectedSwitch.name];
      form.reset({
        switchName: selectedSwitch.name,
        // Always use the tagged switch type (e.g. "button", "dial", "lever")
        switchType: selectedSwitch.switchType,
        movementAxis: existingConfig?.movementAxis || "",
        switchDescription: existingConfig?.switchDescription || "",
        movementMode: existingConfig?.movementMode || false,
        momentarySwitch: existingConfig?.momentarySwitch || false,
        defaultPosition: existingConfig?.defaultPosition,
        upperLimit: existingConfig?.upperLimit ?? "",
        lowerLimit: existingConfig?.lowerLimit ?? "",
        bleedMargins: existingConfig?.bleedMargins ?? "",
      });
    }
  }, [selectedSwitch, planeData, form]);

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
    <Card className="flex flex-col h-full">
      {/* Wrap everything in the Form provider */}
      <Form {...form}>
        {/* Make the form cover the whole card */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Switch Config</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto space-y-4">
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Configuring..." : "Configure Switch"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
