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
import type { Control } from "react-hook-form";

interface FieldProps {
  control: Control<any>;
}

export function SwitchTypeField({ control }: FieldProps) {
  return (
    <FormField
      control={control}
      name="switchType"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Switch Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function SwitchNameField({ control }: FieldProps) {
  return (
    <FormField
      control={control}
      name="switchName"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Switch Name</FormLabel>
          <FormControl>
            <Input placeholder="BatSwitch1" {...field} autoComplete="off" />
          </FormControl>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function SwitchDescriptionField({ control }: FieldProps) {
  return (
    <FormField
      control={control}
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
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export function MovementModeField({ control }: FieldProps) {
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

export function MovementAxisField({ control }: FieldProps) {
  return (
    <FormField
      control={control}
      name="movementAxis"
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>Movement Axis</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

export function UpperLimitField({ control }: FieldProps) {
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
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
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

export function LowerLimitField({ control }: FieldProps) {
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
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
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

export function BleedMarginsField({ control }: FieldProps) {
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
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
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

export function MomentarySwitchField({ control }: FieldProps) {
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

export function DefaultPositionField({ control }: FieldProps) {
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
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              autoComplete="off"
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
