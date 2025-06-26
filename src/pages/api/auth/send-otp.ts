import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    // Supabase requires the E.164 format (e.g., +821012345678)
    const formattedPhone = `+82${phone.substring(1)}`;

    // Use Supabase auth to send the OTP.
    // This assumes the user is already logged in and we are just verifying a phone number.
    // If you want to use this for sign-up/login, the method is slightly different.
    const { error } = await supabase.auth.updateUser({
      phone: formattedPhone,
    });

    // To send an OTP without associating it with a user yet (e.g., during sign-up)
    // you would use:
    // const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

    if (error) {
      console.error("Supabase send OTP error:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to send verification code." });
    }

    return res
      .status(200)
      .json({ message: "Verification code sent successfully." });
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
