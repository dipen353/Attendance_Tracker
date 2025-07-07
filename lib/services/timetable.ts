import { supabase } from '../supabase'
import { Database } from '../database.types'

type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row']
type TimetableInsert = Database['public']['Tables']['timetable_entries']['Insert']
type TimetableUpdate = Database['public']['Tables']['timetable_entries']['Update']

export async function getTimetableEntries(subjectId?: string): Promise<TimetableEntry[]> {
  let query = supabase
    .from('timetable_entries')
    .select(`
      *,
      subjects (
        id,
        name,
        code
      )
    `)
    .order('day_of_week')
    .order('start_time')

  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createTimetableEntry(entry: TimetableInsert): Promise<TimetableEntry> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .insert(entry)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTimetableEntry(id: string, updates: TimetableUpdate): Promise<TimetableEntry> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('timetable_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTodaysTimetable(): Promise<TimetableEntry[]> {
  const today = new Date().getDay()
  
  const { data, error } = await supabase
    .from('timetable_entries')
    .select(`
      *,
      subjects (
        id,
        name,
        code
      )
    `)
    .eq('day_of_week', today)
    .order('start_time')

  if (error) throw error
  return data || []
}

export async function getWeeklyTimetable(): Promise<Record<number, TimetableEntry[]>> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select(`
      *,
      subjects (
        id,
        name,
        code
      )
    `)
    .order('day_of_week')
    .order('start_time')

  if (error) throw error

  // Group by day of week
  const grouped: Record<number, TimetableEntry[]> = {}
  for (let i = 0; i <= 6; i++) {
    grouped[i] = []
  }

  data?.forEach(entry => {
    grouped[entry.day_of_week].push(entry)
  })

  return grouped
}