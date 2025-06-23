import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { accessToken, newPassword } = req.body;

    // Validate input
    if (!accessToken || !newPassword) {
      return res.status(400).json({ error: 'Access token and new password are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 1. Exchange the code (access token from URL) for a valid session.
    // This verifies that the user came from the legitimate password reset email.
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(accessToken);
    
    if (sessionError || !sessionData?.user) {
        console.error('Error exchanging code for session:', sessionError?.message);
        return res.status(401).json({ error: 'Invalid or expired token. Please request a new password reset link.' });
    }

    // 2. With a valid session, update the user's password.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    return res.status(200).json({ message: 'Password updated successfully.' });

  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
