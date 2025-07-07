'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSubject } from '@/lib/services/subjects'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface AddSubjectDialogProps {
  onSubjectAdded: () => void
}

export function AddSubjectDialog({ onSubjectAdded }: AddSubjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    required_percentage: 75
  })
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name.trim()) {
      toast.error('Please enter a subject name')
      return
    }

    setIsLoading(true)
    try {
      const newSubject = await createSubject({
        user_id: user.id,
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        required_percentage: formData.required_percentage,
        total_classes: 0,
        attended_classes: 0
      })

      if (newSubject) {
        toast.success('Subject added successfully!')
        setFormData({ name: '', code: '', required_percentage: 75 })
        setIsOpen(false)
        onSubjectAdded()
      }
    } catch (error) {
      console.error('Error creating subject:', error)
      toast.error('Failed to add subject. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Subject
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Subject</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add a new subject to track your attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Mathematics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="e.g., MATH101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="percentage">Required Attendance (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                value={formData.required_percentage}
                onChange={(e) => setFormData({ ...formData, required_percentage: parseInt(e.target.value) || 75 })}
                required
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Subject'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}