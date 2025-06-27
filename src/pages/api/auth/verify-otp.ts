"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { phone, token } = req.body;

    if (!phone || !token) {
      return res
        .status(400)
        .json({ error: "Phone number and token are required." });
    }

    const formattedPhone = `+82${phone.substring(1)}`;

    // Use Supabase auth to verify the OTP.
    // The `type` 'phone_change' is used when updating a phone for an existing user.
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: "phone_change",
    });

    if (error) {
      console.error("Supabase verify OTP error:", error.message);
      return res.status(400).json({ error: "Invalid verification code." });
    }

    // The user's phone number is now confirmed in the auth.users table.
    return res.status(200).json({
      message: "Phone number verified successfully.",
      user: data.user,
    });
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
