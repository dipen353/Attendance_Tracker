'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getTodaysTimetable } from '@/lib/services/timetable'
import { getSubjects } from '@/lib/services/subjects'
import { markAttendance } from '@/lib/services/attendance'
import { calculateAttendancePercentage } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface Subject {
  id: string
  name: string
  code: string
  total_classes: number
  attended_classes: number
  required_percentage: number
}

interface TimetableEntry {
  id: string
  subject_id: string
  day_of_week: number
  start_time: string
  end_time: string
  subjects?: Subject
}

export function OptimizedDashboard() {
  const { user } = useAuth()
  const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([])
  const [todaySubjects, setTodaySubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null)

  const loadTodayData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load today's timetable
      const timetableData = await getTodaysTimetable()
      setTodayClasses(timetableData)
      
      // Get subjects for today's classes only
      if (timetableData.length > 0) {
        const todaySubjectIds = [...new Set(timetableData.map(t => t.subject_id))]
        const allSubjects = await getSubjects(user.id)
        const relevantSubjects = allSubjects.filter(s => todaySubjectIds.includes(s.id))
        setTodaySubjects(relevantSubjects)
      } else {
        setTodaySubjects([])
      }
    } catch (error) {
      // Silent error handling for better UX
      setTodayClasses([])
      setTodaySubjects([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTodayData()
  }, [loadTodayData])

  const handleMarkAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    if (!user) return

    setMarkingAttendance(subjectId)
    try {
      const today = new Date().toISOString().split('T')[0]
      await markAttendance(subjectId, today, status)
      
      toast.success(`Marked as ${status === 'present' ? 'Present' : 'Absent'}`)
      
      // Quick refresh of today's subjects only
      const allSubjects = await getSubjects(user.id)
      const todaySubjectIds = [...new Set(todayClasses.map(t => t.subject_id))]
      const updatedSubjects = allSubjects.filter(s => todaySubjectIds.includes(s.id))
      setTodaySubjects(updatedSubjects)
      
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    } finally {
      setMarkingAttendance(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today's Classes
        </h2>
        
        {todayClasses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayClasses.map((classItem) => (
              <Card key={classItem.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {classItem.subjects?.name || 'Unknown Subject'}
                  </CardTitle>
                  <CardDescription>
                    {classItem.subjects?.code} • {classItem.start_time} - {classItem.end_time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkAttendance(classItem.subject_id, 'present')}
                      disabled={markingAttendance === classItem.subject_id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {markingAttendance === classItem.subject_id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMarkAttendance(classItem.subject_id, 'absent')}
                      disabled={markingAttendance === classItem.subject_id}
                      className="flex-1"
                    >
                      {markingAttendance === classItem.subject_id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No classes scheduled for today
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Add your timetable to see today's classes
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's Subject Overview - Only if there are classes */}
      {todaySubjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Today's Subject Overview
          </h2>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {todaySubjects.map((subject) => {
              const percentage = calculateAttendancePercentage(
                subject.attended_classes, 
                subject.total_classes
              )
              
              return (
                <Card key={subject.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    </div>
                    <div className={`text-right ${
                      percentage >= 75 ? 'text-green-600' : 
                      percentage >= 65 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <div className="font-bold">{percentage}%</div>
                      <div className="text-sm">{subject.attended_classes}/{subject.total_classes}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">View All Subjects</p>
              <p className="text-sm text-gray-500">Manage all your subjects</p>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Manage Timetable</p>
              <p className="text-sm text-gray-500">Set your class schedule</p>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">View Analytics</p>
              <p className="text-sm text-gray-500">Check your performance</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}