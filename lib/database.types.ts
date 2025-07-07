export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          code: string
          total_classes: number
          attended_classes: number
          required_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          code?: string | null
          total_classes?: number
          attended_classes?: number
          required_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          code?: string
          total_classes?: number
          attended_classes?: number
          required_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          subject_id: string
          user_id: string
          date: string
          status: 'present' | 'absent' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          user_id: string
          date: string
          status: 'present' | 'absent' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          user_id?: string
          date?: string
          status?: 'present' | 'absent' | 'cancelled'
          created_at?: string
        }
      }
      timetable_entries: {
        Row: {
          id: string
          subject_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}