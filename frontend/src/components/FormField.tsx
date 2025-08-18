"use client";

import React from "react";
import { Controller, FieldValues, Path, Control } from 'react-hook-form';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password" | "file";
}

function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-medium text-slate-300">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value || ""}
              className="h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </FormControl>
          <FormMessage className="text-red-400 text-sm" />
        </FormItem>
      )}
    />
  );
}

export default FormField;
