import * as z from "zod"
export const formSchema = z
  .object({
    switchType: z.union([
      z.enum(["lever", "dial", "button", "throttle"]),
      z.literal("GROUP SELECTED")
    ], {
      required_error: "switch type is required",
      invalid_type_error: "switch type is required",
    }),
    switchName: z.string().min(1, "switch name is required"),
    switchDescription: z.string().min(5, "switch description must be at least 5 characters long"),
    movementAxis: z.enum(["X", "Y", "Z"], {
      required_error: "movement axis is required",
      invalid_type_error: "movement axis is required",
    }),
    movementMode: z.boolean(),
    momentarySwitch: z.boolean(),
    bleedMargins: z.number({
      required_error: "bleed margins are required",
      invalid_type_error: "bleed margins must be a number",
    }),
    defaultPosition: z.number().optional(),
    upperLimit: z.number({
      required_error: "upper limit is required",
      invalid_type_error: "upper limit must be a number",
    }),
    lowerLimit: z.number({
      required_error: "lower limit is required",
      invalid_type_error: "lower limit must be a number",
    }),
    rawNodeName: z.string().optional(), // Added raw node name field (optional to maintain backward compatibility)
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
      message: "all momentary switch fields are required when momentary switch is enabled",
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
      message: "lower limit must be less than upper limit",
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
      message: "default position must be between lower and upper limits",
      path: ["defaultPosition"],
    },
  )
export type FormData = z.infer<typeof formSchema>