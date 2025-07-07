'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { markAttendance } from '@/lib/services/attendance'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Calendar, RotateCcw } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface EnhancedAttendanceButtonsWithResetProps {
  subjectId: string
  onAttendanceMarked: () => void
  date?: string
}

export function EnhancedAttendanceButtonsWithReset({ 
  subjectId, 
  onAttendanceMarked, 
  date 
}: EnhancedAttendanceButtonsWithResetProps) {
  const { user } = useAuth()
  const [isMarking, setIsMarking] = useState<'present' | 'absent' | 'cancelled' | null>(null)
  const [lastAction, setLastAction] = useState<'present' | 'absent' | 'cancelled' | null>(null)

  const targetDate = date || new Date().toISOString().split('T')[0]

  const handleMarkAttendance = async (status: 'present' | 'absent' | 'cancelled') => {
    if (!user) return

    setIsMarking(status)
    try {
      await markAttendance(subjectId, targetDate, status)
      
      const statusText = {
        present: 'Present',
        absent: 'Absent', 
        cancelled: 'Cancelled'
      }[status]
      
      toast.success(`Marked as ${statusText} for ${targetDate}`)
      setLastAction(status)
      onAttendanceMarked()
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance. Please try again.')
    } finally {
      setIsMarking(null)
    }
  }

  const handleReset = () => {
    setLastAction(null)
    toast.info('Input reset. You can mark attendance again.')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          onClick={() => handleMarkAttendance('present')}
          disabled={!!isMarking}
          variant={lastAction === 'present' ? 'default' : 'outline'}
          className={`flex-1 ${lastAction === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          size="sm"
        >
          {isMarking === 'present' ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Present
            </>
          )}
        </Button>
        
        <Button
          onClick={() => handleMarkAttendance('absent')}
          disabled={!!isMarking}
          variant={lastAction === 'absent' ? 'destructive' : 'outline'}
          className="flex-1"
          size="sm"
        >
          {isMarking === 'absent' ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Absent
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleMarkAttendance('cancelled')}
          disabled={!!isMarking}
          variant={lastAction === 'cancelled' ? 'secondary' : 'outline'}
          className="flex-1"
          size="sm"
        >
          {isMarking === 'cancelled' ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-1" />
              Cancelled
            </>
          )}
        </Button>

        {lastAction && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="px-3"
            title="Reset input"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}