'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getSubjects } from '@/lib/services/subjects'
import { calculateAttendancePercentage } from '@/lib/utils'
import { 
  Home, 
  Calendar, 
  Clock, 
  BarChart3, 
  Settings, 
  LogOut,
  User
} from 'lucide-react'

interface MainNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MainNavigation({ currentView, onViewChange }: MainNavigationProps) {
  const { user, signOut } = useAuth()
  const [overallPercentage, setOverallPercentage] = useState(0)

  useEffect(() => {
    if (user) {
      loadOverallPercentage()
    }
  }, [user])

  // Refresh percentage when view changes (lightweight update)
  useEffect(() => {
    if (user && currentView === 'dashboard') {
      loadOverallPercentage()
    }
  }, [currentView, user])

  const loadOverallPercentage = async () => {
    if (!user) return
    
    try {
      const subjects = await getSubjects(user.id)
      if (subjects.length === 0) {
        setOverallPercentage(0)
        return
      }
      
      const totalClasses = subjects.reduce((sum, s) => sum + s.total_classes, 0)
      const totalAttended = subjects.reduce((sum, s) => sum + s.attended_classes, 0)
      const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0
      setOverallPercentage(percentage)
    } catch (error) {
      // Silent error handling for better performance
      setOverallPercentage(0)
    }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-100'
    if (percentage >= 65) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BarChart3 },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AttendTrack
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart Attendance Management
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => onViewChange(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* Overall Percentage & User Menu */}
          <div className="flex items-center gap-3">
            {/* Overall Percentage */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPercentageColor(overallPercentage)}`}>
              {overallPercentage.toFixed(1)}%
            </div>
            
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => onViewChange(item.id)}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}