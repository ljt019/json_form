import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeJsonExtension(fileName: string): string {
  return fileName.endsWith(".json") ? fileName.slice(0, -5) : fileName
}