import { supabase } from '../supabase'
import { Database } from '../database.types'
import { updateSubjectAttendance } from './subjects'
import { format } from 'date-fns'

type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row']
type AttendanceInsert = Database['public']['Tables']['attendance_records']['Insert']
type AttendanceUpdate = Database['public']['Tables']['attendance_records']['Update']

export async function getAttendanceRecords(subjectId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('subject_id', subjectId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAttendanceForDate(subjectId: string, date: string): Promise<AttendanceRecord | null> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('date', date)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

export async function markAttendance(
  subjectId: string, 
  date: string | Date, 
  status: 'present' | 'absent' | 'cancelled'
): Promise<AttendanceRecord> {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')
  
  // Check if record already exists
  const existing = await getAttendanceForDate(subjectId, dateStr)
  
  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ status })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error

    // Update subject attendance counts if status changed
    if (existing.status !== status) {
      let attendedChange = 0
      if (existing.status === 'present' && status === 'absent') {
        attendedChange = -1
      } else if (existing.status === 'absent' && status === 'present') {
        attendedChange = 1
      }
      
      if (attendedChange !== 0) {
        await updateSubjectAttendance(subjectId, attendedChange)
      }
    }

    return data
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        subject_id: subjectId,
        user_id: user.id,
        date: dateStr,
        status
      })
      .select()
      .single()

    if (error) throw error

    // Update subject attendance counts
    const attendedChange = status === 'present' ? 1 : 0
    const totalChange = 1
    await updateSubjectAttendance(subjectId, attendedChange, totalChange)

    return data
  }
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  // Get the record first to update subject counts
  const { data: record, error: fetchError } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Delete the record
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', id)

  if (error) throw error

  // Update subject attendance counts
  const attendedChange = record.status === 'present' ? -1 : 0
  const totalChange = -1
  await updateSubjectAttendance(record.subject_id, attendedChange, totalChange)
}

export async function getAttendanceByDateRange(
  subjectId: string, 
  startDate: string, 
  endDate: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('subject_id', subjectId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw error
  return data || []
}