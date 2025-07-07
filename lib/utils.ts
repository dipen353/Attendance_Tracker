import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isToday, startOfWeek, endOfWeek } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = "PPP") {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function isDateToday(date: string | Date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isToday(dateObj)
}

export function getWeekRange(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }) // Sunday
  }
}

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

export function getAttendanceStatus(percentage: number, criteria: number = 75) {
  if (percentage >= criteria) return 'safe'
  if (percentage >= criteria - 10) return 'warning'
  return 'danger'
}

export function getRequiredAttendance(attended: number, total: number, criteria: number = 75) {
  const currentPercentage = calculateAttendancePercentage(attended, total)
  
  if (currentPercentage >= criteria) {
    // Calculate how many classes can be missed
    let canMiss = 0
    let tempTotal = total
    
    while (calculateAttendancePercentage(attended, tempTotal + 1) >= criteria) {
      tempTotal++
      canMiss++
    }
    
    return {
      type: 'can_miss' as const,
      count: canMiss,
      message: canMiss > 0 ? `You can miss ${canMiss} more class${canMiss > 1 ? 'es' : ''}` : 'Cannot miss any more classes'
    }
  } else {
    // Calculate how many classes need to be attended
    let needToAttend = 0
    let tempAttended = attended
    let tempTotal = total
    
    while (calculateAttendancePercentage(tempAttended, tempTotal) < criteria) {
      tempAttended++
      tempTotal++
      needToAttend++
    }
    
    return {
      type: 'need_to_attend' as const,
      count: needToAttend,
      message: `Need to attend ${needToAttend} more class${needToAttend > 1 ? 'es' : ''} consecutively`
    }
  }
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || 'Unknown'
}

export function getDayOfWeek(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj.getDay()
}