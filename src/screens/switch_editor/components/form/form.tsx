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

export function PlaneForm({ selectedSwitches }: PlaneFormProps) {
  const hasSelectedSwitches = selectedSwitches.length > 0;
  const { data: planeData } = useGetSelectedConfigData();

  // Initialize with empty values when no switch is selected
  const defaultValues: FormData = {
    switchName: "",
    switchType: "button",
    movementAxis: "X",
    switchDescription: "",
    movementMode: false,
    momentarySwitch: false,
    defaultPosition: undefined,
    upperLimit: 0,
    lowerLimit: 0,
    bleedMargins: 0,
  };

  // Override with actual values when switches are selected
  if (hasSelectedSwitches) {
    const primarySwitch = selectedSwitches[0];
    const existingConfig = planeData?.switches[primarySwitch.name];

    defaultValues.switchName =
      selectedSwitches.length > 1 ? "GROUP SELECTED" : primarySwitch.name;
    defaultValues.switchType =
      selectedSwitches.length > 1
        ? "GROUP SELECTED"
        : (primarySwitch.switchType as
            | "button"
            | "dial"
            | "lever"
            | "throttle");
    defaultValues.movementAxis = (existingConfig?.movementAxis ?? "X") as
      | "X"
      | "Y"
      | "Z";
    defaultValues.switchDescription = existingConfig?.switchDescription ?? "";
    defaultValues.movementMode = existingConfig?.movementMode ?? false;
    defaultValues.momentarySwitch = existingConfig?.momentarySwitch ?? false;
    defaultValues.defaultPosition = existingConfig?.defaultPosition;
    defaultValues.upperLimit = Number(existingConfig?.upperLimit ?? 0);
    defaultValues.lowerLimit = Number(existingConfig?.lowerLimit ?? 0);
    defaultValues.bleedMargins = Number(existingConfig?.bleedMargins ?? 0);
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isMomentary = form.watch("momentarySwitch");

  const { mutate: createNewSwitch, isPending } = useCreateNewSwitch();

  const onSubmit = async (data: FormData) => {
    if (!hasSelectedSwitches) return;

    try {
      let validatedData = formSchema.parse(data);
      if (
        !validatedData.momentarySwitch &&
        validatedData.defaultPosition === undefined
      ) {
        validatedData = { ...validatedData, defaultPosition: 0 };
      }

      if (selectedSwitches.length > 1) {
        const batchedPayload = selectedSwitches.map((sw) => ({
          ...validatedData,
          switchName: sw.name,
          switchType: sw.switchType,
        }));
        createNewSwitch(batchedPayload as any);
      } else {
        const primarySwitch = selectedSwitches[0];
        createNewSwitch({
          ...validatedData,
          switchName: primarySwitch.name,
          switchType: primarySwitch.switchType as any,
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
            <CardTitle className="text-2xl font-bold">
              {hasSelectedSwitches ? "Switch Config" : "No Switch Selected"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SwitchNameField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
              <SwitchTypeField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
            </div>
            <SwitchDescriptionField
              control={form.control}
              disabled={!hasSelectedSwitches}
            />
            <MovementModeField
              control={form.control}
              disabled={!hasSelectedSwitches}
            />
            <MovementAxisField
              control={form.control}
              disabled={!hasSelectedSwitches}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UpperLimitField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
              <LowerLimitField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
              <BleedMarginsField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
            </div>
            <MomentarySwitchField
              control={form.control}
              disabled={!hasSelectedSwitches}
            />
            <div
              className={`transition-all duration-300 ease-in-out ${
                isMomentary
                  ? "max-h-20 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <DefaultPositionField
                control={form.control}
                disabled={!hasSelectedSwitches}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !hasSelectedSwitches}
            >
              {isPending
                ? "configuring..."
                : hasSelectedSwitches
                ? "configure switch"
                : "select a switch"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
