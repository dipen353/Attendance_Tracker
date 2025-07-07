# 🚀 AttendTrack Setup Guide

Follow these steps to get your attendance tracker up and running!

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))
- A Vercel account for deployment (optional, free at [vercel.com](https://vercel.com))

## 🛠️ Setup Steps

### 1. Install Dependencies

```bash
cd attendance-tracker-polished
npm install
```

### 2. Set Up Supabase Database

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Get your project credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Create database tables:**
   - Go to your Supabase dashboard
   - Click on "SQL Editor"
   - Copy and paste the SQL from the README.md file
   - Click "Run" to create all tables and policies

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

### 4. Test the Application

1. **Create an account:**
   - Click "Create Account" on the login page
   - Enter your email, password, and name
   - Check your email for verification (if required)

2. **Add a subject:**
   - Click "Add Subject" on the dashboard
   - Enter subject name, code, and attendance criteria

3. **Mark attendance:**
   - Use the "Present" or "Absent" buttons for today's classes
   - View your attendance statistics

## 🚀 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/attendance-tracker&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Option 2: Manual Deploy

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/attendance-tracker.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app is live!** 🎉

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (for production) | No |

### Customization

- **Theme**: The app supports light/dark mode automatically
- **Colors**: Modify `app/globals.css` to change the color scheme
- **Features**: Add new features by extending the services in `lib/services/`

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Check that your Supabase URL and anon key are correct
   - Make sure there are no extra spaces in your `.env.local` file

2. **Database connection errors:**
   - Ensure you've run the SQL setup script in Supabase
   - Check that Row Level Security policies are enabled

3. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check that your Node.js version is 18 or higher

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)
- Open an issue on GitHub if you find bugs

## 🎯 Next Steps

Once your app is running, you can:

1. **Add more subjects** and start tracking attendance
2. **Invite friends** to use the app (each user has their own data)
3. **Customize the interface** to match your preferences
4. **Add new features** like:
   - Attendance reports
   - Calendar integration
   - Notification reminders
   - Data export/import

Happy tracking! 📚✨