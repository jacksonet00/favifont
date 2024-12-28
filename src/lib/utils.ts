/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logWrapper(...args: any[]): void {
  if (process.env.ENV !== 'PROD') {
    console.log(...args);
  }
}

export function errorWrapper(...args: any[]): void {
  if (process.env.ENV !== 'PROD') {
    console.error(...args);
  }
}