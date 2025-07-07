# 📚 AttendTrack - Smart Attendance Management System

A modern, feature-rich attendance tracking application built with Next.js 15, Supabase, and TypeScript. Track your class attendance with intelligent insights and beautiful visualizations.

![AttendTrack Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.35.0-green)

## ✨ Features

### 🎯 Core Functionality
- **Smart Attendance Tracking** - Mark attendance as Present/Absent/Cancelled
- **Subject Management** - Add, edit, and delete subjects with custom criteria
- **Timetable Management** - Create weekly class schedules
- **Real-time Statistics** - Live attendance percentage calculations
- **Monthly Calendar** - Visual attendance history with day-wise statistics

### 📊 Advanced Analytics
- **Overall Percentage Display** - Color-coded navbar indicator
- **Smart Recommendations** - Classes to attend/miss for maintaining criteria
- **Performance Insights** - Subject-wise breakdown and risk assessment
- **Enhanced Calendar Stats** - Fully/partially attended, absent, and cancelled days

### 🎨 User Experience
- **Modern UI/UX** - Clean, intuitive interface with dark/light mode
- **Mobile Responsive** - Perfect experience on all devices
- **Fast Performance** - Optimized loading and lightweight components
- **Real-time Updates** - Instant data synchronization

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd attendance-tracker-polished
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Create a `.env.local` file and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  total_classes INTEGER DEFAULT 0,
  attended_classes INTEGER DEFAULT 0,
  criteria INTEGER DEFAULT 75,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, date)
);

-- Create timetable_entries table
CREATE TABLE timetable_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subjects
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for attendance_records
CREATE POLICY "Users can view their own attendance records" ON attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = attendance_records.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own attendance records" ON attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = attendance_records.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attendance records" ON attendance_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = attendance_records.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attendance records" ON attendance_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = attendance_records.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

-- Create RLS policies for timetable_entries
CREATE POLICY "Users can view their own timetable entries" ON timetable_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = timetable_entries.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own timetable entries" ON timetable_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = timetable_entries.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own timetable entries" ON timetable_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = timetable_entries.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own timetable entries" ON timetable_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM subjects 
      WHERE subjects.id = timetable_entries.subject_id 
      AND subjects.user_id = auth.uid()
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetable_entries_updated_at BEFORE UPDATE ON timetable_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📱 Features Overview

### Dashboard
- Quick overview of today's classes
- Attendance statistics
- Risk assessment for each subject

### Subjects Management
- Add/edit/delete subjects
- Set attendance criteria (default 75%)
- View detailed statistics

### Attendance Tracking
- Mark attendance for any date
- Bulk attendance marking
- Visual calendar view

### Timetable
- Weekly schedule view
- Add/edit class timings
- Integration with attendance tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **State Management**: React Context + Hooks

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.