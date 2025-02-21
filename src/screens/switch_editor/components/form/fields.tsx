import {
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
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";

interface FieldProps {
  control: Control<any>;
  disabled?: boolean;
}

export function SwitchTypeField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="switchType"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Switch Type</FormLabel>
          <FormControl>
            <Input
              placeholder="Button"
              {...field}
              autoComplete="off"
              disabled={true}
              className="capitalize"
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function SwitchNameField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="switchName"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Switch Name</FormLabel>
          <FormControl>
            <Input
              placeholder="BatSwitch1"
              {...field}
              autoComplete="off"
              disabled={true}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function SwitchDescriptionField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="switchDescription"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Switch Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Air pressure switch"
              {...field}
              autoComplete="off"
              className="resize-none"
              disabled={disabled}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function MovementModeField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="movementMode"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Movement Mode</FormLabel>
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Discrete</FormLabel>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function MovementAxisField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="movementAxis"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Movement Axis</FormLabel>
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
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
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function UpperLimitField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="upperLimit"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Upper Limit</FormLabel>
          <FormControl>
            <Input
              placeholder="90.0"
              type="number"
              step="any"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
              disabled={disabled}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function LowerLimitField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="lowerLimit"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Lower Limit</FormLabel>
          <FormControl>
            <Input
              placeholder="0.0"
              type="number"
              step="any"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
              disabled={disabled}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function BleedMarginsField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="bleedMargins"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Bleed Margins</FormLabel>
          <FormControl>
            <Input
              placeholder="0.5"
              type="number"
              step="any"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
              disabled={disabled}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function MomentarySwitchField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="momentarySwitch"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Momentary Switch</FormLabel>
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Momentary</FormLabel>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function DefaultPositionField({ control, disabled }: FieldProps) {
  return (
    <FormField
      control={control}
      name="defaultPosition"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Default Momentary Switch Position</FormLabel>
          <FormControl>
            <Input
              placeholder="45.0"
              type="number"
              step="any"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
              disabled={disabled}
            />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}
