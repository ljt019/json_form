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
  selectedSwitches: SwitchItem[];
}

/*
the outer component renders nothing if no switch is selected.
when at least one switch is selected, it renders the internal form.
*/
export function PlaneForm({ selectedSwitches }: PlaneFormProps) {
  if (selectedSwitches.length === 0) {
    return null;
  }
  // use a key based on the names of selected switches joined together
  const key = selectedSwitches.map((sw) => sw.name).join("-");
  return <PlaneFormInternal key={key} selectedSwitches={selectedSwitches} />;
}

/*
the internal form component initializes with default values based
on the selected switches and configuration data.
*/
function PlaneFormInternal({
  selectedSwitches,
}: {
  selectedSwitches: SwitchItem[];
}) {
  const { data: planeData } = useGetSelectedConfigData();
  // for a group, if the switches have different configurations,
  // you might choose to leave the field empty or use a placeholder.
  const primarySwitch = selectedSwitches[0];
  const existingConfig = planeData?.switches[primarySwitch.name];

  // if more than one switch is selected, set group placeholders for fields that must be unique.
  const defaultValues: FormData = {
    switchName:
      selectedSwitches.length > 1 ? "GROUP SELECTED" : primarySwitch.name,
    switchType:
      selectedSwitches.length > 1
        ? "GROUP SELECTED"
        : (primarySwitch.switchType as
            | "button"
            | "dial"
            | "lever"
            | "throttle"),
    movementAxis: (existingConfig?.movementAxis ?? "") as "X" | "Y" | "Z",
    switchDescription: existingConfig?.switchDescription ?? "",
    movementMode: existingConfig?.movementMode ?? false,
    momentarySwitch: existingConfig?.momentarySwitch ?? false,
    defaultPosition: existingConfig?.defaultPosition ?? undefined,
    upperLimit: Number(existingConfig?.upperLimit ?? 0),
    lowerLimit: Number(existingConfig?.lowerLimit ?? 0),
    bleedMargins: Number(existingConfig?.bleedMargins ?? 0),
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
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

      if (selectedSwitches.length > 1) {
        // for each selected switch, override the group placeholder values with the actual values.
        const batchedPayload = selectedSwitches.map((sw) => ({
          ...validatedData,
          switchName: sw.name,
          switchType: sw.switchType,
        }));
        createNewSwitch(batchedPayload);
      } else {
        createNewSwitch({
          ...validatedData,
          switchName: primarySwitch.name,
          switchType: primarySwitch.switchType,
        });
      }
    } catch (error) {
      console.error("error submitting form:", error);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold">switch config</CardTitle>
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
              {isPending ? "configuring..." : "configure switch"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
