import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // This is the page where the user will be redirected to set their new password.
    // You will need to create this page in your application.
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/sign/update-password`;

    // Call Supabase's built-in function to send the password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      // For security, do not reveal if the user does or does not exist.
      // Log the actual error on the server, but send a generic success message.
      console.error('Password reset error:', error.message);
    }
    
    // Always return a success message to prevent user enumeration attacks.
    return res.status(200).json({
      message: 'If an account with this email exists, a password reset link has been sent.',
    });

  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
