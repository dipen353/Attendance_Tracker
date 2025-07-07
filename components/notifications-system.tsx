'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Target,
  CheckCircle,
  X,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getSubjects } from '@/lib/services/subjects'
import { getTodaysTimetable } from '@/lib/services/timetable'
import { calculateAttendancePercentage } from '@/lib/utils'
import { format, addMinutes, isAfter, isBefore } from 'date-fns'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'warning' | 'reminder' | 'achievement' | 'urgent'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
}

interface NotificationSettings {
  lowAttendanceWarnings: boolean
  classReminders: boolean
  achievementAlerts: boolean
  weeklyReports: boolean
  reminderMinutes: number
}

export function NotificationsSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    lowAttendanceWarnings: true,
    classReminders: true,
    achievementAlerts: true,
    weeklyReports: true,
    reminderMinutes: 15
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
      // Set up periodic checks
      const interval = setInterval(checkForNotifications, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [user, settings])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      await checkForNotifications()
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForNotifications = async () => {
    if (!user) return

    const newNotifications: Notification[] = []

    try {
      // Check for low attendance warnings
      if (settings.lowAttendanceWarnings) {
        const subjects = await getSubjects(user.id)
        subjects.forEach(subject => {
          const percentage = calculateAttendancePercentage(subject.attended_classes, subject.total_classes)
          
          if (percentage < subject.required_percentage) {
            const classesNeeded = Math.ceil((subject.required_percentage * (subject.total_classes + 5) / 100) - subject.attended_classes)
            newNotifications.push({
              id: `low-attendance-${subject.id}`,
              type: 'warning',
              title: 'Low Attendance Warning',
              message: `${subject.name} is at ${percentage}%. You need ${classesNeeded} more classes to meet criteria.`,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
          }

          // Critical warning for very low attendance
          if (percentage < subject.required_percentage - 10) {
            newNotifications.push({
              id: `critical-attendance-${subject.id}`,
              type: 'urgent',
              title: 'Critical Attendance Alert',
              message: `${subject.name} attendance is critically low at ${percentage}%. Immediate action required!`,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
          }
        })
      }

      // Check for upcoming classes
      if (settings.classReminders) {
        const todaysTimetable = await getTodaysTimetable(user.id)
        const now = new Date()
        const reminderTime = addMinutes(now, settings.reminderMinutes)

        todaysTimetable.forEach(entry => {
          const classTime = new Date(`${format(now, 'yyyy-MM-dd')} ${entry.start_time}`)
          
          if (isAfter(classTime, now) && isBefore(classTime, reminderTime)) {
            newNotifications.push({
              id: `reminder-${entry.id}`,
              type: 'reminder',
              title: 'Upcoming Class',
              message: `${entry.subjects?.name || entry.subject_id} class starts at ${entry.start_time}`,
              timestamp: new Date(),
              read: false
            })
          }
        })
      }

      // Check for achievements
      if (settings.achievementAlerts) {
        const subjects = await getSubjects(user.id)
        subjects.forEach(subject => {
          const percentage = calculateAttendancePercentage(subject.attended_classes, subject.total_classes)
          
          // Perfect attendance achievement
          if (percentage === 100 && subject.total_classes >= 10) {
            newNotifications.push({
              id: `perfect-${subject.id}`,
              type: 'achievement',
              title: 'Perfect Attendance!',
              message: `Congratulations! You have perfect attendance in ${subject.name}`,
              timestamp: new Date(),
              read: false
            })
          }

          // Improvement achievement
          if (percentage >= subject.required_percentage + 10) {
            newNotifications.push({
              id: `excellent-${subject.id}`,
              type: 'achievement',
              title: 'Excellent Attendance',
              message: `Great job! ${subject.name} attendance is at ${percentage}%`,
              timestamp: new Date(),
              read: false
            })
          }
        })
      }

      // Filter out duplicates and update state
      const existingIds = notifications.map(n => n.id)
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.includes(n.id))
      
      if (uniqueNewNotifications.length > 0) {
        setNotifications(prev => [...uniqueNewNotifications, ...prev].slice(0, 50)) // Keep last 50
        
        // Show toast for urgent notifications
        uniqueNewNotifications.forEach(notification => {
          if (notification.type === 'urgent') {
            toast.error(notification.title, {
              description: notification.message
            })
          } else if (notification.type === 'achievement') {
            toast.success(notification.title, {
              description: notification.message
            })
          }
        })
      }

    } catch (error) {
      console.error('Error checking notifications:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'achievement':
        return 'default'
      default:
        return 'outline'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Recent Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications yet. You're all caught up! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        notification.read ? 'bg-muted/50' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(notification.timestamp, 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Customize when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="low-attendance">Low Attendance Warnings</Label>
                <input
                  type="checkbox"
                  id="low-attendance"
                  checked={settings.lowAttendanceWarnings}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, lowAttendanceWarnings: e.target.checked }))
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="class-reminders">Class Reminders</Label>
                <input
                  type="checkbox"
                  id="class-reminders"
                  checked={settings.classReminders}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, classReminders: e.target.checked }))
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="achievements">Achievement Alerts</Label>
                <input
                  type="checkbox"
                  id="achievements"
                  checked={settings.achievementAlerts}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, achievementAlerts: e.target.checked }))
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <input
                  type="checkbox"
                  id="weekly-reports"
                  checked={settings.weeklyReports}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))
                  }
                  className="w-5 h-5 accent-blue-600"
                />
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time (minutes before class)</Label>
                <select
                  id="reminder-time"
                  value={settings.reminderMinutes}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total notifications</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Unread</span>
                <Badge variant="destructive">{unreadCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Urgent alerts</span>
                <Badge variant="destructive">
                  {notifications.filter(n => n.type === 'urgent').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}