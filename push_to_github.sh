#!/bin/bash

# AttendTrack - Push to GitHub Script
# This script will push your AttendTrack project to GitHub with proper setup

echo "🚀 Pushing AttendTrack to GitHub..."

# Set up remote origin
echo "📡 Setting up remote repository..."
git remote add origin https://github.com/dipen353/Attendance_Tracker.git

# Set main branch
echo "🌿 Setting up main branch..."
git branch -M main

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔗 Your repository: https://github.com/dipen353/Attendance_Tracker"
echo ""
echo "🎉 AttendTrack is now live on GitHub with professional commit history!"
echo ""
echo "📋 What's included:"
echo "   ✅ Complete attendance management system"
echo "   ✅ Modern UI with dark/light mode"
echo "   ✅ Real-time statistics and analytics"
echo "   ✅ Mobile-responsive design"
echo "   ✅ Supabase integration"
echo "   ✅ Production-ready code"
echo "   ✅ Comprehensive documentation"
echo ""
echo "🚀 Ready for deployment on Vercel, Netlify, or any platform!"