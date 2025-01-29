import { invoke } from "@tauri-apps/api/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface FormData {
  switchType: "lever" | "dial" | "button" | "throttle";
  switchName: string;
  switchDescription: string;
  movementAxis: "X" | "Y" | "Z";
  movementMode: boolean;
  momentarySwitch: boolean;
  bleedMargins?: number;
  defaultPosition?: number;
  upperLimit?: number;
  lowerLimit?: number;
}

const formSchema = z
  .object({
    switchType: z.enum(["lever", "dial", "button", "throttle"], {
      required_error: "Switch type is required",
      invalid_type_error: "Switch type is required",
    }),
    switchName: z.string().min(1, "Switch name is required"),
    switchDescription: z
      .string()
      .min(5, "Switch description must be at least 5 characters long"),
    movementAxis: z.enum(["X", "Y", "Z"], {
      required_error: "Movement axis is required",
      invalid_type_error: "Movement axis is required",
    }),
    movementMode: z.boolean(),
    momentarySwitch: z.boolean(),
    bleedMargins: z.number().optional(),
    defaultPosition: z.number().optional(),
    upperLimit: z.number().optional(),
    lowerLimit: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.momentarySwitch) {
        return (
          data.bleedMargins !== undefined &&
          data.defaultPosition !== undefined &&
          data.upperLimit !== undefined &&
          data.lowerLimit !== undefined
        );
      }
      return true;
    },
    {
      message:
        "All momentary switch fields are required when momentary switch is enabled",
      path: ["momentarySwitch"],
    }
  )
  .refine(
    (data) => {
      if (
        data.momentarySwitch &&
        data.upperLimit !== undefined &&
        data.lowerLimit !== undefined
      ) {
        return data.lowerLimit < data.upperLimit;
      }
      return true;
    },
    {
      message: "Lower limit must be less than upper limit",
      path: ["lowerLimit"],
    }
  )
  .refine(
    (data) => {
      if (
        data.momentarySwitch &&
        data.upperLimit !== undefined &&
        data.lowerLimit !== undefined &&
        data.defaultPosition !== undefined
      ) {
        return (
          data.defaultPosition >= data.lowerLimit &&
          data.defaultPosition <= data.upperLimit
        );
      }
      return true;
    },
    {
      message: "Default position must be between lower and upper limits",
      path: ["defaultPosition"],
    }
  );

export function PlaneForm() {
  const form = useForm<z.infer<typeof formSchema>>({
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

  const isMomentary = useWatch({
    control: form.control,
    name: "momentarySwitch",
  });

  const [showMomentaryFields, setShowMomentaryFields] = useState(false);

  useEffect(() => {
    if (isMomentary) {
      setShowMomentaryFields(true);
    } else {
      const timer = setTimeout(() => setShowMomentaryFields(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMomentary]);

  const getFieldError = (error: any) => {
    if (!error) return null;

    if (error.type === "invalid_enum_value") {
      if (error.path.includes("switchType")) return "Switch type is required";
      if (error.path.includes("movementAxis"))
        return "Movement axis is required";
    }

    return error.message;
  };

  async function save_form_data(formData: FormData) {
    await invoke("save_json_file", { formData: formData })
      .then((filePath) => console.log(`File saved to: ${filePath}`))
      .catch((error) => console.error(`Error saving file: ${error}`));
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let validatedData;
      if (data.momentarySwitch) {
        validatedData = formSchema.parse(data);
      } else {
        // If momentarySwitch is false, remove the momentary switch fields before validation
        const {
          bleedMargins,
          defaultPosition,
          upperLimit,
          lowerLimit,
          ...restData
        } = data;
        validatedData = formSchema.parse(restData);
      }

      // Save the form data
      await save_form_data(validatedData);
      console.log("Form submitted:", validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        error.errors.forEach((err) => {
          form.setError(err.path[0] as any, { message: err.message });
        });
      } else {
        console.error("Error submitting form:", error);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pt-8 max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="switchType"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Switch Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select switch type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lever">Lever</SelectItem>
                      <SelectItem value="dial">Dial</SelectItem>
                      <SelectItem value="button">Button</SelectItem>
                      <SelectItem value="throttle">Throttle</SelectItem>
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="switchName"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Switch Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="BatSwitch1"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="switchDescription"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Switch Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Air pressure switch"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movementAxis"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Movement Axis</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select movement axis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="X">X</SelectItem>
                      <SelectItem value="Y">Y</SelectItem>
                      <SelectItem value="Z">Z</SelectItem>
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movementMode"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Movement Mode</FormLabel>
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Discrete</FormLabel>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="momentarySwitch"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Momentary Switch</FormLabel>
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Momentary</FormLabel>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError(error)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div
              className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isMomentary ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {showMomentaryFields && (
                <>
                  <FormField
                    control={form.control}
                    name="defaultPosition"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Default Momentary Switch Position</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="45.0"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            autoComplete="off"
                          />
                        </FormControl>
                        {error && form.formState.isSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            {getFieldError(error)}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="upperLimit"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Upper Momentary Switch Limit</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="90.0"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            autoComplete="off"
                          />
                        </FormControl>
                        {error && form.formState.isSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            {getFieldError(error)}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowerLimit"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Lower Momentary Switch Limit</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.0"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            autoComplete="off"
                          />
                        </FormControl>
                        {error && form.formState.isSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            {getFieldError(error)}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bleedMargins"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Momentary Switch Bleed Margins</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.5"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            autoComplete="off"
                          />
                        </FormControl>
                        {error && form.formState.isSubmitted && (
                          <p className="text-red-500 text-sm mt-1">
                            {getFieldError(error)}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full">
          Create Json File
        </Button>
      </form>
    </Form>
  );
}
