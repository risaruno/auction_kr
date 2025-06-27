import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = await createClient()
  // --- READ (GET) - Fetch all FAQs ---
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false }) // Show newest first

      if (error) throw error
      return res.status(200).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- CREATE (POST) - Add a new FAQ ---
  if (req.method === 'POST') {
    try {
      const { question, answer, category } = req.body
      if (!question || !answer || !category) {
        return res
          .status(400)
          .json({ error: 'Question, answer, and category are required.' })
      }
      const { data, error } = await supabase
        .from('faqs')
        .insert([{ question, answer, category }])
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- UPDATE (PUT) - Edit an existing FAQ ---
  if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body
      if (!id) {
        return res
          .status(400)
          .json({ error: 'FAQ ID is required for an update.' })
      }
      const { data, error } = await supabase
        .from('faqs')
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

  // --- DELETE - Remove an FAQ ---
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      if (!id) {
        return res
          .status(400)
          .json({ error: 'FAQ ID is required for deletion.' })
      }
      const { error } = await supabase.from('faqs').delete().eq('id', id)

      if (error) throw error
      return res.status(200).json({ message: 'FAQ deleted successfully.' })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // Handle other HTTP methods
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
