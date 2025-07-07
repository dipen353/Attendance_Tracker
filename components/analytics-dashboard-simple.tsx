'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getSubjects } from '@/lib/services/subjects'
import { calculateAttendancePercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  total_classes: number
  attended_classes: number
  required_percentage: number
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [overallStats, setOverallStats] = useState({
    totalSubjects: 0,
    averageAttendance: 0,
    subjectsAtRisk: 0,
    subjectsOnTrack: 0,
    totalClasses: 0,
    totalAttended: 0
  })

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
    }
  }, [user])

  const loadAnalyticsData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const subjectsData = await getSubjects(user.id)
      setSubjects(subjectsData)

      // Calculate overall statistics
      const totalSubjects = subjectsData.length
      const totalClasses = subjectsData.reduce((sum, s) => sum + s.total_classes, 0)
      const totalAttended = subjectsData.reduce((sum, s) => sum + s.attended_classes, 0)
      const averageAttendance = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0

      const subjectsAtRisk = subjectsData.filter(s => {
        const percentage = calculateAttendancePercentage(s.attended_classes, s.total_classes)
        return percentage < s.required_percentage
      }).length

      const subjectsOnTrack = totalSubjects - subjectsAtRisk

      setOverallStats({
        totalSubjects,
        averageAttendance,
        subjectsAtRisk,
        subjectsOnTrack,
        totalClasses,
        totalAttended
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSubjectsByPerformance = () => {
    return subjects.map(subject => {
      const percentage = calculateAttendancePercentage(subject.attended_classes, subject.total_classes)
      const status = percentage >= subject.required_percentage ? 'good' : 
                    percentage >= subject.required_percentage - 10 ? 'warning' : 'risk'
      
      return { ...subject, percentage, status }
    }).sort((a, b) => a.percentage - b.percentage)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  const subjectsByPerformance = getSubjectsByPerformance()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive overview of your attendance performance
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
                <p className="text-2xl font-bold">{overallStats.averageAttendance.toFixed(1)}%</p>
              </div>
              <div className={`p-2 rounded-full ${
                overallStats.averageAttendance >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {overallStats.averageAttendance >= 75 ? 
                  <TrendingUp className="h-5 w-5" /> : 
                  <TrendingDown className="h-5 w-5" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subjects On Track</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.subjectsOnTrack}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subjects At Risk</p>
                <p className="text-2xl font-bold text-red-600">{overallStats.subjectsAtRisk}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold">{overallStats.totalAttended}/{overallStats.totalClasses}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>
            Detailed breakdown of attendance by subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjectsByPerformance.length > 0 ? (
            <div className="space-y-4">
              {subjectsByPerformance.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      subject.status === 'good' ? 'bg-green-500' :
                      subject.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{subject.code}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">{subject.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.attended_classes}/{subject.total_classes} classes
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Required</p>
                    <p className="font-medium">{subject.required_percentage}%</p>
                  </div>
                  
                  <div className="text-right">
                    {subject.status === 'good' ? (
                      <div className="text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        On Track
                      </div>
                    ) : subject.status === 'warning' ? (
                      <div className="text-yellow-600 text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Warning
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        <TrendingDown className="h-4 w-4 inline mr-1" />
                        At Risk
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No subjects added yet. Add subjects to see analytics.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {overallStats.subjectsAtRisk > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectsByPerformance
                .filter(s => s.status === 'risk')
                .map((subject) => {
                  const classesNeeded = Math.max(0, Math.ceil(
                    (subject.required_percentage * subject.total_classes - 100 * subject.attended_classes) / 
                    (100 - subject.required_percentage)
                  ))
                  
                  return (
                    <div key={subject.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="font-medium text-red-800 dark:text-red-200">
                        {subject.name}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Attend {classesNeeded} more classes to reach {subject.required_percentage}% attendance
                      </p>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}