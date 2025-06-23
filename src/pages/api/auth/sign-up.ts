import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";

export default async function signUpHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, email, password } = req.body;

    // 1. Validate all required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 2. Use Supabase's signUp method
    const { data, error } = await supabase.auth.signUp({
      email: email as string,
      password: password as string,
      options: {
        // Store the user's full name in the metadata
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error('Supabase sign-up error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    // 3. Handle the response from Supabase
    if (data.user) {
      // Supabase's default is to require email confirmation.
      // The user object is returned, but the session is null until confirmed.
      return res.status(200).json({
        message: 'Sign-up successful! Please check your email to verify your account.',
        user: data.user,
      });
    }

    return res.status(500).json({ error: 'An unexpected error occurred during sign-up.' });

  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
