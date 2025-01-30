import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema, type FormData } from "@/components/form/schema";
import {
  SwitchTypeField,
  SwitchNameField,
  SwitchDescriptionField,
  MovementModeField,
  MovementAxisField,
  SwitchLimitsFields,
  BleedMarginsField,
  MomentarySwitchField,
  DefaultPositionField,
} from "@/components/form/fields";

export function PlaneForm() {
  const [showMomentaryFields, setShowMomentaryFields] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => setShowMomentaryFields(isMomentary), 300);
    return () => clearTimeout(timer);
  }, [isMomentary]);

  async function saveFormData(formData: FormData) {
    try {
      await invoke("add_new_switch", { formData });
    } catch (error) {
      console.log(error);
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      let validatedData = formSchema.parse(data);

      if (
        !validatedData.momentarySwitch &&
        validatedData.defaultPosition === undefined
      ) {
        validatedData = { ...validatedData, defaultPosition: 0 };
      }

      await saveFormData(validatedData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        New Switch Form
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pt-8 max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeftColumn control={form.control} />
            <RightColumn
              control={form.control}
              isMomentary={isMomentary}
              showMomentaryFields={showMomentaryFields}
            />
          </div>
          <Button type="submit" className="w-full">
            Create JSON File
          </Button>
        </form>
      </Form>
    </div>
  );
}

function LeftColumn({ control }: { control: any }) {
  return (
    <div className="space-y-4">
      <SwitchTypeField control={control} />
      <SwitchNameField control={control} />
      <SwitchDescriptionField control={control} />
      <MovementModeField control={control} />
      <MovementAxisField control={control} />
    </div>
  );
}

function RightColumn({
  control,
  isMomentary,
  showMomentaryFields,
}: {
  control: any;
  isMomentary: boolean;
  showMomentaryFields: boolean;
}) {
  return (
    <div className="space-y-4">
      <SwitchLimitsFields control={control} />
      <BleedMarginsField control={control} />
      <MomentarySwitchField control={control} />
      <div
        className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
          isMomentary ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showMomentaryFields && <DefaultPositionField control={control} />}
      </div>
    </div>
  );
}
