'use server';
import { createClient } from '@/utils/server';

export default async function fetchExperts() {
  const supabase = await createClient();
  let { data: experts, error } = await supabase.from('experts').select('*')

  if (error) {
    console.error('Error fetching experts:', error);
    return null;
  }

  if (!experts) {
    console.error('No experts found');
    return null;
  }
  return experts;
}