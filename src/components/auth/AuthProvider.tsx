"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client"; // Adjust path to your Supabase client
import { Session, User } from "@supabase/supabase-js";

// 1. Define the shape of your context data
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// 2. Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

// 3. Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once when the component mounts
    const getInitialSession = async () => {
      // Get the initial session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Set up a listener for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]); // Include supabase.auth in dependencies

  const value = {
    user,
    session,
    loading,
  };

  // Provide the auth state to the rest of your app
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Create a custom hook to easily access the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
