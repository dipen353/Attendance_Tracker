'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AuthForm } from '@/components/auth-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MainNavigation } from '@/components/main-navigation'
import { OptimizedDashboard } from '@/components/optimized-dashboard'
import { SubjectsManager } from '@/components/subjects-manager'
import { TimetableManager } from '@/components/timetable-manager'
import { EnhancedMonthlyCalendar } from '@/components/enhanced-monthly-calendar'
import { AnalyticsDashboard } from '@/components/analytics-dashboard-simple'

export function MainApp() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <OptimizedDashboard />
      case 'subjects':
        return <SubjectsManager />
      case 'timetable':
        return <TimetableManager />
      case 'calendar':
        return <EnhancedMonthlyCalendar />
      case 'analytics':
        return <AnalyticsDashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainNavigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  )
}