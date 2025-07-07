'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubjects } from '@/lib/services/subjects'
import { calculateAttendancePercentage } from '@/lib/utils'
import { AddSubjectDialog } from './add-subject-dialog'
import { EditSubjectDialog } from './edit-subject-dialog'
import { EnhancedAttendanceButtonsWithReset } from './enhanced-attendance-buttons-with-reset'
import { toast } from 'sonner'
import { Plus, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  total_classes: number
  attended_classes: number
  required_percentage: number
}

export function SubjectsManager() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubjects()
    }
  }, [user])

  const loadSubjects = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getSubjects(user.id)
      setSubjects(data)
    } catch (error) {
      console.error('Error loading subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectUpdated = () => {
    loadSubjects()
  }

  const getStatusColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'text-green-600'
    if (percentage >= required - 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (percentage: number, required: number) => {
    if (percentage >= required) return <CheckCircle className="h-4 w-4" />
    if (percentage >= required - 10) return <AlertTriangle className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  const calculateClassesNeeded = (subject: Subject) => {
    const percentage = calculateAttendancePercentage(subject.attended_classes, subject.total_classes)
    
    if (percentage >= 75) {
      // Calculate classes can miss
      const canMiss = Math.floor(
        (subject.attended_classes - 0.75 * subject.total_classes) / 0.75
      )
      return { type: 'can_miss', count: Math.max(0, canMiss) }
    } else {
      // Calculate classes needed
      const needed = Math.ceil(
        (0.75 * subject.total_classes - subject.attended_classes) / 0.25
      )
      return { type: 'need_attend', count: Math.max(0, needed) }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading subjects...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Subjects
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subjects and track attendance
          </p>
        </div>
        <AddSubjectDialog onSubjectAdded={handleSubjectUpdated} />
      </div>

      {subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const percentage = calculateAttendancePercentage(
              subject.attended_classes, 
              subject.total_classes
            )
            const classInfo = calculateClassesNeeded(subject)
            
            return (
              <Card key={subject.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subject.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center ${getStatusColor(percentage, subject.required_percentage)}`}>
                        {getStatusIcon(percentage, subject.required_percentage)}
                        <span className="ml-1 font-bold">{percentage}%</span>
                      </div>
                      <EditSubjectDialog 
                        subject={subject} 
                        onSubjectUpdated={handleSubjectUpdated}
                        onSubjectDeleted={handleSubjectUpdated}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>{subject.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Attended:</span>
                      <span>{subject.attended_classes}/{subject.total_classes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Required:</span>
                      <span>{subject.required_percentage}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= subject.required_percentage
                            ? 'bg-green-500'
                            : percentage >= subject.required_percentage - 10
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    {/* Classes guidance */}
                    <div className="text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      {classInfo.type === 'can_miss' ? (
                        <p className="text-green-600">
                          ✅ Can miss <strong>{classInfo.count}</strong> more classes
                        </p>
                      ) : (
                        <p className="text-red-600">
                          ⚠️ Need <strong>{classInfo.count}</strong> more classes for 75%
                        </p>
                      )}
                    </div>
                    
                    <EnhancedAttendanceButtonsWithReset 
                      subjectId={subject.id}
                      onAttendanceMarked={handleSubjectUpdated}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No subjects added yet
            </p>
            <AddSubjectDialog onSubjectAdded={handleSubjectUpdated} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}