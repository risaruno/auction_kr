import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from "../../utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- READ (GET) ---
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('experts').select('*')
      if (error) throw error
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- CREATE (POST) ---
  if (req.method === 'POST') {
    try {
      const { name, location, description, services } = req.body
      if (!name || !location) {
        return res
          .status(400)
          .json({ error: 'Name and location are required.' })
      }
      const { data, error } = await supabase
        .from('experts')
        .insert([{ name, location, description, services }])
        .select()
        .single() // .single() returns the created object instead of an array

      if (error) throw error
      return res.status(201).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- UPDATE (PUT) ---
  if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body
      if (!id) {
        return res
          .status(400)
          .json({ error: 'Expert ID is required for an update.' })
      }
      const { data, error } = await supabase
        .from('experts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- DELETE ---
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      if (!id) {
        return res
          .status(400)
          .json({ error: 'Expert ID is required for deletion.' })
      }
      const { error } = await supabase.from('experts').delete().eq('id', id)

      if (error) throw error
      return res.status(200).json({ message: 'Expert deleted successfully.' })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Handle other methods
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
