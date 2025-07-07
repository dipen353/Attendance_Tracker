-- AttendTrack Complete Database Setup Script
-- Run this in a NEW Supabase SQL query to set up the complete system
-- This script creates all tables, indexes, policies, and functions needed

-- Enable Row Level Security on tables (will be created)
-- This is safe to run even if tables don't exist yet

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  total_classes INTEGER DEFAULT 0,
  attended_classes INTEGER DEFAULT 0,
  required_percentage DECIMAL DEFAULT 75.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table with enhanced status options
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'cancelled')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, user_id, date)
);

-- Create timetable_entries table for weekly scheduling
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_subject_id ON public.timetable_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_day ON public.timetable_entries(day_of_week);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects table
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;

CREATE POLICY "Users can view their own subjects" ON public.subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON public.subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON public.subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON public.subjects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for attendance_records table
DROP POLICY IF EXISTS "Users can view their own attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can insert their own attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can update their own attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can delete their own attendance records" ON public.attendance_records;

CREATE POLICY "Users can view their own attendance records" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance records" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance records" ON public.attendance_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance records" ON public.attendance_records
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for timetable_entries table
DROP POLICY IF EXISTS "Users can view timetable entries for their subjects" ON public.timetable_entries;
DROP POLICY IF EXISTS "Users can insert timetable entries for their subjects" ON public.timetable_entries;
DROP POLICY IF EXISTS "Users can update timetable entries for their subjects" ON public.timetable_entries;
DROP POLICY IF EXISTS "Users can delete timetable entries for their subjects" ON public.timetable_entries;

CREATE POLICY "Users can view timetable entries for their subjects" ON public.timetable_entries
  FOR SELECT USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timetable entries for their subjects" ON public.timetable_entries
  FOR INSERT WITH CHECK (
    subject_id IN (
      SELECT id FROM public.subjects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update timetable entries for their subjects" ON public.timetable_entries
  FOR UPDATE USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete timetable entries for their subjects" ON public.timetable_entries
  FOR DELETE USING (
    subject_id IN (
      SELECT id FROM public.subjects WHERE user_id = auth.uid()
    )
  );

-- Function to update subject statistics automatically
CREATE OR REPLACE FUNCTION update_subject_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle both INSERT/UPDATE and DELETE operations
  IF TG_OP = 'DELETE' THEN
    UPDATE public.subjects 
    SET 
      total_classes = (
        SELECT COUNT(*) 
        FROM public.attendance_records 
        WHERE subject_id = OLD.subject_id
      ),
      attended_classes = (
        SELECT COUNT(*) 
        FROM public.attendance_records 
        WHERE subject_id = OLD.subject_id AND status = 'present'
      ),
      updated_at = NOW()
    WHERE id = OLD.subject_id;
    
    RETURN OLD;
  ELSE
    UPDATE public.subjects 
    SET 
      total_classes = (
        SELECT COUNT(*) 
        FROM public.attendance_records 
        WHERE subject_id = NEW.subject_id
      ),
      attended_classes = (
        SELECT COUNT(*) 
        FROM public.attendance_records 
        WHERE subject_id = NEW.subject_id AND status = 'present'
      ),
      updated_at = NOW()
    WHERE id = NEW.subject_id;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subject statistics
DROP TRIGGER IF EXISTS update_subject_stats_trigger ON public.attendance_records;
CREATE TRIGGER update_subject_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_subject_stats();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 AttendTrack database setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created:';
  RAISE NOTICE '   - subjects (with user isolation)';
  RAISE NOTICE '   - attendance_records (present/absent/cancelled)';
  RAISE NOTICE '   - timetable_entries (weekly scheduling)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Features enabled:';
  RAISE NOTICE '   - Row Level Security (RLS)';
  RAISE NOTICE '   - Automatic statistics updates';
  RAISE NOTICE '   - Performance indexes';
  RAISE NOTICE '   - Data validation constraints';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your AttendTrack system is ready to use!';
  RAISE NOTICE '   Go to your app and start adding subjects.';
END $$;