declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';
  import { CookieOptions } from '@supabase/auth-helpers-shared';

  export interface CookieMethodsAPI {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
    remove(name: string, options?: CookieOptions): void;
    getAll(): Array<{ name: string; value: string }>;
    setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: CookieOptions;
      }>
    ): void;
  }

  export function createServerClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options: { cookies: CookieMethodsAPI }
  ): SupabaseClient<Database>;
}