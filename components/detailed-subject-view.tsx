'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getSubject } from '@/lib/services/subjects'
import { getAttendanceRecords } from '@/lib/services/attendance'
import { calculateAttendancePercentage } from '@/lib/utils'
import { EnhancedAttendanceButtons } from './enhanced-attendance-buttons'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Subject {
  id: string
  name: string
  code: string
  total_classes: number
  attended_classes: number
  required_percentage: number
}

interface AttendanceRecord {
  id: string
  date: string
  status: 'present' | 'absent' | 'cancelled'
}

interface DetailedSubjectViewProps {
  subjectId: string
  onBack: () => void
  onAttendanceUpdated: () => void
}

export function DetailedSubjectView({ subjectId, onBack, onAttendanceUpdated }: DetailedSubjectViewProps) {
  const { user } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && subjectId) {
      loadData()
    }
  }, [user, subjectId])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [subjectData, recordsData] = await Promise.all([
        getSubject(subjectId),
        getAttendanceRecords(subjectId)
      ])
      
      setSubject(subjectData)
      setAttendanceRecords(recordsData)
    } catch (error) {
      console.error('Error loading subject details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceMarked = () => {
    loadData()
    onAttendanceUpdated()
  }

  if (loading || !subject) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading subject details...</p>
        </CardContent>
      </Card>
    )
  }

  const percentage = calculateAttendancePercentage(subject.attended_classes, subject.total_classes)
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length
  const cancelledCount = attendanceRecords.filter(r => r.status === 'cancelled').length

  // Calculate classes needed to maintain criteria
  const classesNeeded = Math.max(0, Math.ceil(
    (subject.required_percentage * subject.total_classes - 100 * subject.attended_classes) / 
    (100 - subject.required_percentage)
  ))

  // Calculate classes that can be missed
  const canMiss = Math.max(0, Math.floor(
    (100 * subject.attended_classes - subject.required_percentage * subject.total_classes) / 
    subject.required_percentage
  ))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {subject.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{subject.code}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold">{percentage}%</p>
              </div>
              <div className={`p-2 rounded-full ${
                percentage >= subject.required_percentage ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {percentage >= subject.required_percentage ? 
                  <TrendingUp className="h-5 w-5" /> : 
                  <TrendingDown className="h-5 w-5" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-yellow-600">{cancelledCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stay on Track</CardTitle>
          </CardHeader>
          <CardContent>
            {percentage >= subject.required_percentage ? (
              <div className="text-green-600">
                <p className="font-medium">✅ You're on track!</p>
                <p className="text-sm mt-1">
                  You can miss up to <strong>{canMiss}</strong> more classes and still maintain {subject.required_percentage}% attendance.
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-medium">⚠️ Attendance below criteria!</p>
                <p className="text-sm mt-1">
                  You need to attend <strong>{classesNeeded}</strong> more classes to reach {subject.required_percentage}% attendance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mark Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedAttendanceButtons 
              subjectId={subject.id}
              onAttendanceMarked={handleAttendanceMarked}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attendanceRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 20)
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <span className="font-medium capitalize">{record.status}</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No attendance records yet. Start marking your attendance!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}