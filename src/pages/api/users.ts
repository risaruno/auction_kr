import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from "../../utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- READ (GET) - Fetch all users with their profiles ---
  if (req.method === 'GET') {
    try {
      // We need to list users from the auth schema, which requires the admin client.
      const {
        data: { users },
        error: listError,
      } = await supabaseAdmin.auth.admin.listUsers()

      if (listError) throw listError

      // Now fetch the corresponding profiles for each user
      const userIds = users.map((user) => user.id)
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profileError) throw profileError

      // Combine the auth user data with the profile data
      const combinedUsers = users.map((user) => {
        const profile = profiles?.find((p) => p.id === user.id)
        return {
          id: user.id,
          name: profile?.full_name || 'N/A',
          email: user.email,
          phone: profile?.phone_number || 'N/A',
          signupDate: new Date(user.created_at).toLocaleDateString(),
          status: user.email_confirmed_at ? 'Active' : 'Pending', // Example status logic
          points: profile?.points || 0,
        }
      })

      return res.status(200).json(combinedUsers)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  // --- UPDATE (PUT) - Update a user's status or points ---
  if (req.method === 'PUT') {
    try {
      const { userId, status, points } = req.body
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' })
      }

      // Update points in the profiles table
      if (points !== undefined) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ points })
          .eq('id', userId)
        if (profileError) throw profileError
      }

      // Update status in the auth.users table (e.g., for banning)
      if (status === 'Suspended') {
        const { error: authError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: 'none', // 'none' means permanent ban in Supabase
          })
        if (authError) throw authError
      }

      return res.status(200).json({ message: 'User updated successfully.' })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
