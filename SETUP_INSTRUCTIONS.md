# 🚀 AttendTrack - Complete Setup Instructions

## Current Status: ✅ Ready for Setup

Your AttendTrack project is properly structured and ready to be made executable. Follow these steps:

## Step 1: Install Dependencies
Run the installation script:
```bash
# Double-click tmp_rovodev_install.bat
# OR run manually:
npm install
```

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for project initialization

### 2.2 Get Your Credentials
1. Go to Settings → API in your Supabase dashboard
2. Copy your Project URL and anon key
3. Update `.env` file with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 2.3 Create Database Tables
Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;

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

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_id ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);

-- RLS Policies for subjects
CREATE POLICY "Users can view their own subjects" ON public.subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON public.subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON public.subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON public.subjects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for attendance_records
CREATE POLICY "Users can view their own attendance records" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance records" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance records" ON public.attendance_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance records" ON public.attendance_records
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 3: Run the Application

### Development Mode
```bash
# Double-click tmp_rovodev_run.bat
# OR run manually:
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Step 4: Test the Application

1. **Open your browser** to `http://localhost:3000`
2. **Create an account** using the signup form
3. **Add a subject** with name, code, and required percentage
4. **Mark attendance** for today's classes
5. **View statistics** and analytics

## 🎯 Features Available

- ✅ **User Authentication** - Secure signup/login with Supabase
- ✅ **Subject Management** - Add, edit, delete subjects
- ✅ **Attendance Tracking** - Mark present/absent for each day
- ✅ **Real-time Statistics** - View attendance percentage and trends
- ✅ **Risk Assessment** - Get warnings when attendance is low
- ✅ **Dark/Light Mode** - Beautiful UI that adapts to preferences
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Data Persistence** - All data stored securely in Supabase

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Check your `.env` file has correct Supabase credentials
   - Ensure no extra spaces in environment variables

2. **Database connection errors:**
   - Verify you've run the SQL setup script
   - Check that RLS policies are enabled

3. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version is 18+

4. **Port already in use:**
   - Change port: `npm run dev -- -p 3001`

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📱 Next Steps

Once running, you can:
1. **Customize the UI** - Edit components in `/components`
2. **Add new features** - Extend services in `/lib/services`
3. **Configure notifications** - Set up email/push notifications
4. **Export data** - Add CSV export functionality
5. **Add calendar integration** - Sync with Google Calendar

## 🆘 Need Help?

- Check the console for error messages
- Verify all environment variables are set
- Ensure Supabase project is active
- Test database connection in Supabase dashboard

Your AttendTrack app is ready to go! 🎉