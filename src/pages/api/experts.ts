import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from "@/utils/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = await createClient();
  console.log(`Received ${req.method} request at /api/experts`);

  // --- READ (GET) ---
  if (req.method === 'GET') {
    console.log("Handling GET request...");
    try {
      const { data, error } = await supabase.from('experts').select('*');
      if (error) throw error;
      console.log("Fetched experts data successfully.");
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error fetching experts data:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // --- CREATE (POST) ---
  if (req.method === 'POST') {
    console.log("Handling POST request...");
    try {
      const { name, location, description, services } = req.body;
      if (!name || !location) {
        console.warn("Name or location missing in request body.");
        return res
          .status(400)
          .json({ error: 'Name and location are required.' });
      }
      const { data, error } = await supabase
        .from('experts')
        .insert([{ name, location, description, services }])
        .select()
        .single();

      if (error) throw error;
      console.log("Expert created successfully:", data);
      return res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating expert:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // --- UPDATE (PUT) ---
  if (req.method === 'PUT') {
    console.log("Handling PUT request...");
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        console.warn("Expert ID missing in request body.");
        return res
          .status(400)
          .json({ error: 'Expert ID is required for an update.' });
      }
      const { data, error } = await supabase
        .from('experts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log("Expert updated successfully:", data);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error updating expert:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // --- DELETE ---
  if (req.method === 'DELETE') {
    console.log("Handling DELETE request...");
    try {
      const { id } = req.body;
      if (!id) {
        console.warn("Expert ID missing in request body.");
        return res
          .status(400)
          .json({ error: 'Expert ID is required for deletion.' });
      }
      const { error } = await supabase.from('experts').delete().eq('id', id);

      if (error) throw error;
      console.log("Expert deleted successfully.");
      return res.status(200).json({ message: 'Expert deleted successfully.' });
    } catch (error: any) {
      console.error("Error deleting expert:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Handle other methods
  console.warn(`Method ${req.method} not allowed.`);
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}