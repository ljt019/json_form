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
import { formSchema, type FormData } from "./schema";
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
} from "./fields";
import useCreateNewSwitch from "@/hooks/mutations/useCreateNewSwitch";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { SwitchItem } from "@/screens/switch_editor/SwitchEditorScreen";

interface PlaneFormProps {
  selectedSwitch: SwitchItem | null;
}

/*
The outer component renders nothing if no switch is selected.
When a switch is selected, it renders the internal form and
forces a remount by setting a key based on the switch's name.
*/
export function PlaneForm({ selectedSwitch }: PlaneFormProps) {
  if (!selectedSwitch) {
    return null;
  }
  return (
    <PlaneFormInternal
      key={selectedSwitch.name}
      selectedSwitch={selectedSwitch}
    />
  );
}

/*
The internal form component initializes with default values based
on the selected switch and configuration data. Using a unique key
on the parent ensures that this component is re-mounted whenever
a new switch is selected.
*/
function PlaneFormInternal({ selectedSwitch }: { selectedSwitch: SwitchItem }) {
  // Fetch the current configuration data (which includes switch-specific configs)
  const { data: planeData } = useGetSelectedConfigData();
  const existingConfig = planeData?.switches[selectedSwitch.name];

  // Build default values using the selected switch and any existing config.
  const defaultValues: FormData = {
    switchName: selectedSwitch.name,
    switchType: selectedSwitch.switchType as
      | "button"
      | "dial"
      | "lever"
      | "throttle",
    movementAxis: (existingConfig?.movementAxis ?? "") as "X" | "Y" | "Z",
    switchDescription: existingConfig?.switchDescription ?? "",
    movementMode: existingConfig?.movementMode ?? false,
    momentarySwitch: existingConfig?.momentarySwitch ?? false,
    defaultPosition: existingConfig?.defaultPosition ?? undefined,
    upperLimit: Number(existingConfig?.upperLimit ?? 0),
    lowerLimit: Number(existingConfig?.lowerLimit ?? 0),
    bleedMargins: Number(existingConfig?.bleedMargins ?? 0),
  };

  // Initialize the form with the default values.
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch for momentary switch value for conditional UI.
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

  console.log(selectedSwitch);

  return (
    <Card className="flex flex-col h-full">
      <Form {...form}>
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
