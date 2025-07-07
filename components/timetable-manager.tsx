'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getSubjects } from '@/lib/services/subjects'
import { createTimetableEntry, getTimetableEntries, deleteTimetableEntry } from '@/lib/services/timetable'
import { toast } from 'sonner'
import { Calendar, Clock, Plus, X, Trash2 } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
}

interface TimetableEntry {
  id: string
  subject_id: string
  day_of_week: number
  start_time: string
  end_time: string
  subjects?: Subject
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TimetableManager() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    subject_id: '',
    day_of_week: 1,
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [subjectsData, timetableData] = await Promise.all([
        getSubjects(user.id),
        getTimetableEntries()
      ])
      
      setSubjects(subjectsData)
      setTimetable(timetableData)
    } catch (error) {
      console.error('Error loading timetable data:', error)
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject_id || !formData.start_time || !formData.end_time) {
      toast.error('Please fill all fields')
      return
    }

    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time')
      return
    }

    try {
      await createTimetableEntry({
        subject_id: formData.subject_id,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time
      })

      toast.success('Timetable entry added successfully!')
      setFormData({ subject_id: '', day_of_week: 1, start_time: '', end_time: '' })
      setIsAddingEntry(false)
      loadData()
    } catch (error) {
      console.error('Error adding timetable entry:', error)
      toast.error('Failed to add timetable entry')
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return
    }

    try {
      await deleteTimetableEntry(entryId)
      toast.success('Timetable entry deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting timetable entry:', error)
      toast.error('Failed to delete timetable entry')
    }
  }

  const groupedTimetable = timetable.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = []
    }
    acc[entry.day_of_week].push(entry)
    return acc
  }, {} as Record<number, TimetableEntry[]>)

  // Sort entries by start time for each day
  Object.keys(groupedTimetable).forEach(day => {
    groupedTimetable[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading timetable...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Timetable
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your weekly class schedule
          </p>
        </div>
        <Button onClick={() => setIsAddingEntry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {isAddingEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add Timetable Entry
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddingEntry(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {DAYS.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Entry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingEntry(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {DAYS.map((day, dayIndex) => (
          <Card key={dayIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupedTimetable[dayIndex]?.length > 0 ? (
                <div className="space-y-2">
                  {groupedTimetable[dayIndex].map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {entry.start_time} - {entry.end_time}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.subjects?.name} ({entry.subjects?.code})
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No classes scheduled for {day}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}