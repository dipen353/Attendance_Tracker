import { supabase } from '../supabase'
import { Database } from '../database.types'

type Subject = Database['public']['Tables']['subjects']['Row']
type SubjectInsert = Database['public']['Tables']['subjects']['Insert']
type SubjectUpdate = Database['public']['Tables']['subjects']['Update']

export async function getSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getSubject(id: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

export async function createSubject(subject: SubjectInsert): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert(subject)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSubject(id: string, updates: SubjectUpdate): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateSubjectAttendance(
  id: string, 
  attendedChange: number, 
  totalChange: number = 0
): Promise<Subject> {
  // First get current values
  const subject = await getSubject(id)
  if (!subject) throw new Error('Subject not found')

  const newAttended = Math.max(0, subject.attended_classes + attendedChange)
  const newTotal = Math.max(0, subject.total_classes + totalChange)

  return updateSubject(id, {
    attended_classes: newAttended,
    total_classes: newTotal
  })
}