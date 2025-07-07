'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getSubjects } from '@/lib/services/subjects'
import { getAttendanceByDateRange } from '@/lib/services/attendance'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

interface Subject {
  id: string
  name: string
  code: string
}

interface AttendanceRecord {
  id: string
  subject_id: string
  date: string
  status: 'present' | 'absent' | 'cancelled'
  subjects?: Subject
}

export function EnhancedMonthlyCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [monthlyStats, setMonthlyStats] = useState({
    fullyAttended: 0,
    partiallyAttended: 0,
    absentDays: 0,
    cancelledDays: 0
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, currentDate, selectedSubject])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const subjectsData = await getSubjects(user.id)
      setSubjects(subjectsData)

      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      
      const startDate = format(monthStart, 'yyyy-MM-dd')
      const endDate = format(monthEnd, 'yyyy-MM-dd')

      let allAttendance: AttendanceRecord[] = []
      
      if (selectedSubject === 'all') {
        for (const subject of subjectsData) {
          const records = await getAttendanceByDateRange(subject.id, startDate, endDate)
          allAttendance = [...allAttendance, ...records.map(r => ({ ...r, subjects: subject }))]
        }
      } else {
        const records = await getAttendanceByDateRange(selectedSubject, startDate, endDate)
        const subject = subjectsData.find(s => s.id === selectedSubject)
        allAttendance = records.map(r => ({ ...r, subjects: subject }))
      }

      setAttendanceRecords(allAttendance)
      calculateMonthlyStats(allAttendance, subjectsData)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyStats = (records: AttendanceRecord[], allSubjects: Subject[]) => {
    const dayGroups: { [date: string]: AttendanceRecord[] } = {}
    
    records.forEach(record => {
      if (!dayGroups[record.date]) {
        dayGroups[record.date] = []
      }
      dayGroups[record.date].push(record)
    })

    let fullyAttended = 0
    let partiallyAttended = 0
    let absentDays = 0
    let cancelledDays = 0

    Object.values(dayGroups).forEach(dayRecords => {
      const presentCount = dayRecords.filter(r => r.status === 'present').length
      const absentCount = dayRecords.filter(r => r.status === 'absent').length
      const cancelledCount = dayRecords.filter(r => r.status === 'cancelled').length

      if (cancelledCount > 0 && presentCount === 0 && absentCount === 0) {
        cancelledDays++
      } else if (presentCount > 0 && absentCount === 0) {
        fullyAttended++
      } else if (presentCount > 0 && absentCount > 0) {
        partiallyAttended++
      } else if (absentCount > 0 && presentCount === 0) {
        absentDays++
      }
    })

    setMonthlyStats({ fullyAttended, partiallyAttended, absentDays, cancelledDays })
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return attendanceRecords.filter(record => record.date === dateStr)
  }

  const getDayStatus = (dayRecords: AttendanceRecord[]) => {
    if (dayRecords.length === 0) return 'none'
    
    const presentCount = dayRecords.filter(r => r.status === 'present').length
    const absentCount = dayRecords.filter(r => r.status === 'absent').length
    const cancelledCount = dayRecords.filter(r => r.status === 'cancelled').length

    if (cancelledCount > 0 && presentCount === 0 && absentCount === 0) return 'cancelled'
    if (presentCount > 0 && absentCount === 0) return 'full'
    if (presentCount > 0 && absentCount > 0) return 'partial'
    if (absentCount > 0 && presentCount === 0) return 'absent'
    
    return 'none'
  }

  const getDayColor = (status: string) => {
    switch (status) {
      case 'full': return 'bg-green-500'
      case 'partial': return 'bg-yellow-500'
      case 'absent': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-100'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Monthly Calendar
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View your attendance history with enhanced statistics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded-md bg-background"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{monthlyStats.fullyAttended}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fully Attended Days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{monthlyStats.partiallyAttended}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Partially Attended Days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{monthlyStats.absentDays}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Absent Days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{monthlyStats.cancelledDays}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled Days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const dayAttendance = getAttendanceForDate(day)
                const dayStatus = getDayStatus(dayAttendance)
                const isToday = isSameDay(day, new Date())
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 min-h-[80px] border rounded-lg ${
                      isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                    } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    
                    {dayStatus !== 'none' && (
                      <div 
                        className={`w-full h-4 rounded ${getDayColor(dayStatus)}`}
                        title={`${dayStatus} day - ${dayAttendance.length} classes`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Fully Attended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Partially Attended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}