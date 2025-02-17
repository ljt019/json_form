import * as z from "zod"

export const formSchema = z
  .object({
    switchType: z.enum(["lever", "dial", "button", "throttle"], {
      required_error: "Switch type is required",
      invalid_type_error: "Switch type is required",
    }),
    switchName: z.string().min(1, "Switch name is required"),
    switchDescription: z.string().min(5, "Switch description must be at least 5 characters long"),
    movementAxis: z.enum(["X", "Y", "Z"], {
      required_error: "Movement axis is required",
      invalid_type_error: "Movement axis is required",
    }),
    movementMode: z.boolean(),
    momentarySwitch: z.boolean(),
    bleedMargins: z.number({
      required_error: "Bleed margins are required",
      invalid_type_error: "Bleed margins must be a number",
    }),
    defaultPosition: z.number().optional(),
    upperLimit: z.number({
      required_error: "Upper limit is required",
      invalid_type_error: "Upper limit must be a number",
    }),
    lowerLimit: z.number({
      required_error: "Lower limit is required",
      invalid_type_error: "Lower limit must be a number",
    }),
  })
  .refine(
    (data) => {
      if (data.momentarySwitch) {
        return (
          data.bleedMargins !== undefined &&
          data.defaultPosition !== undefined &&
          data.upperLimit !== undefined &&
          data.lowerLimit !== undefined
        )
      }
      return true
    },
    {
      message: "All momentary switch fields are required when momentary switch is enabled",
      path: ["momentarySwitch"],
    },
  )
  .refine(
    (data) => {
      if (data.momentarySwitch && data.upperLimit !== undefined && data.lowerLimit !== undefined) {
        return data.lowerLimit < data.upperLimit
      }
      return true
    },
    {
      message: "Lower limit must be less than upper limit",
      path: ["lowerLimit"],
    },
  )
  .refine(
    (data) => {
      if (
        data.momentarySwitch &&
        data.upperLimit !== undefined &&
        data.lowerLimit !== undefined &&
        data.defaultPosition !== undefined
      ) {
        return data.defaultPosition >= data.lowerLimit && data.defaultPosition <= data.upperLimit
      }
      return true
    },
    {
      message: "Default position must be between lower and upper limits",
      path: ["defaultPosition"],
    },
  )

export type FormData = z.infer<typeof formSchema>

