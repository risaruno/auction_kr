import { fetchExperts } from '@/app/api/expert/actions'

export default async function getExperts() {
  try {
    const result = await fetchExperts()
    return result.data
  } catch (error) {
    console.error('Error fetching experts:', error)
    return null
  }
}