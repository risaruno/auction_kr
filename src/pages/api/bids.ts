import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 2. Get the logged-in user from the access token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (userError || !user) {
      return res.status(401).json({
        error: "Unauthorized: You must be logged in to submit an application.",
      });
    }

    // 3. Destructure and validate the form data from the request body
    const formData = req.body;
    const { caseResult, bidAmt } = formData;

    if (!caseResult?.data || !bidAmt) {
      return res
        .status(400)
        .json({ error: "Case information and bid amount are required." });
    }

    // 4. Prepare the data for insertion into the 'bidding_applications' table
    const applicationData = {
      user_id: user.id, // Link the application to the logged-in user
      case_number: caseResult.data.caseNumber,
      court_name: caseResult.data.courtName,
      bid_date: caseResult.data.bidDate,
      bid_amount: Number(bidAmt.replace(/,/g, "")), // Ensure bidAmt is a number
      // Add other fields from your DB schema as needed
      // e.g., service_fee: 100000,
    };

    // 5. Insert the new application into the database
    const { data, error: insertError } = await supabase
      .from("bidding_applications")
      .insert([applicationData])
      .select()
      .single();

    if (insertError) throw insertError;

    // 6. Return the newly created application data
    return res.status(201).json({
      message: "Application submitted successfully!",
      application: data,
    });
  } catch (error: any) {
    console.error("Bid submission error:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to submit application.", details: error.message });
  }
}
