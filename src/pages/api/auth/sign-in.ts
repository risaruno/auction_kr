import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient();
  // 1. Only allow POST requests for security
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;
    
    // 2. Validate the input from the client
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // 3. Call the Supabase sign-in function
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    });

    // 4. Handle any errors from Supabase
    if (error) {
      console.error("Supabase login error:", error.message);
      // Provide a generic error message to the client for security
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    // 5. If login is successful, return the session and user data
    if (data.session && data.user) {
      return res.status(200).json({
        message: "Login successful",
        user: data.user,
        session: data.session,
      });
    } else {
      // This is an unlikely edge case but good to handle
      return res
        .status(500)
        .json({ error: "An unexpected error occurred during login." });
    }
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
