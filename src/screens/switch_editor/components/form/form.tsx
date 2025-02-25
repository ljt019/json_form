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
import { useSwitchSelection } from "@/hooks/useSwitchSelection";
import { useEffect } from "react";

function FormContent() {
  const { data: planeData } = useGetSelectedConfigData();
  const { selectedSwitches } = useSwitchSelection();

  const hasSelectedSwitches = selectedSwitches.length > 0;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      rawNodeName: "",
    },
  });

  useEffect(() => {
    if (hasSelectedSwitches) {
      const primarySwitch = selectedSwitches[0];
      const existingConfig = planeData?.switches[primarySwitch.name];

      form.reset({
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
        movementAxis: (existingConfig?.movementAxis ?? "X") as "X" | "Y" | "Z",
        switchDescription: existingConfig?.switchDescription ?? "",
        movementMode: existingConfig?.movementMode ?? false,
        momentarySwitch: existingConfig?.momentarySwitch ?? false,
        defaultPosition: existingConfig?.defaultPosition,
        upperLimit: Number(existingConfig?.upperLimit ?? 0),
        lowerLimit: Number(existingConfig?.lowerLimit ?? 0),
        bleedMargins: Number(existingConfig?.bleedMargins ?? 0),
        rawNodeName: existingConfig?.rawNodeName ?? primarySwitch.mesh.name,
      });
    }
  }, [selectedSwitches, planeData, form, hasSelectedSwitches]);

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
          rawNodeName: sw.mesh.name,
        }));
        createNewSwitch(batchedPayload as any);
      } else {
        const primarySwitch = selectedSwitches[0];
        createNewSwitch({
          ...validatedData,
          switchName: primarySwitch.name,
          switchType: primarySwitch.switchType as any,
          rawNodeName: primarySwitch.mesh.name,
        });
      }
    } catch (error) {
      console.error("error submitting form:", error);
    }
  };

  return (
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
  );
}

export function PlaneForm() {
  return (
    <Card className="flex flex-col h-full">
      <FormContent />
    </Card>
  );
}
