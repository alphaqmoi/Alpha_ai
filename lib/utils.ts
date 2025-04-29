import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default supabase;
