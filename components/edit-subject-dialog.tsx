'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSubject, deleteSubject } from '@/lib/services/subjects'
import { toast } from 'sonner'
import { Settings, X, Trash2 } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  total_classes: number
  attended_classes: number
  required_percentage: number
}

interface EditSubjectDialogProps {
  subject: Subject
  onSubjectUpdated: () => void
  onSubjectDeleted: () => void
}

export function EditSubjectDialog({ subject, onSubjectUpdated, onSubjectDeleted }: EditSubjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: subject.name,
    code: subject.code || '',
    required_percentage: subject.required_percentage,
    total_classes: subject.total_classes,
    attended_classes: subject.attended_classes
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a subject name')
      return
    }

    if (formData.attended_classes > formData.total_classes) {
      toast.error('Attended classes cannot be more than total classes')
      return
    }

    if (formData.attended_classes < 0 || formData.total_classes < 0) {
      toast.error('Class counts cannot be negative')
      return
    }

    setIsLoading(true)
    try {
      await updateSubject(subject.id, {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        required_percentage: formData.required_percentage,
        total_classes: formData.total_classes,
        attended_classes: formData.attended_classes
      })

      toast.success('Subject updated successfully!')
      setIsOpen(false)
      onSubjectUpdated()
    } catch (error) {
      console.error('Error updating subject:', error)
      toast.error('Failed to update subject. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSubject(subject.id)
      toast.success('Subject deleted successfully!')
      setIsOpen(false)
      onSubjectDeleted()
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error('Failed to delete subject. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Subject</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Update subject details and attendance counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Subject Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-code">Subject Code</Label>
              <Input
                id="edit-code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-percentage">Required Attendance (%)</Label>
              <Input
                id="edit-percentage"
                type="number"
                min="0"
                max="100"
                value={formData.required_percentage}
                onChange={(e) => setFormData({ ...formData, required_percentage: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-total">Total Classes</Label>
                <Input
                  id="edit-total"
                  type="number"
                  min="0"
                  value={formData.total_classes}
                  onChange={(e) => setFormData({ ...formData, total_classes: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-attended">Attended Classes</Label>
                <Input
                  id="edit-attended"
                  type="number"
                  min="0"
                  max={formData.total_classes}
                  value={formData.attended_classes}
                  onChange={(e) => setFormData({ ...formData, attended_classes: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
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
                {isLoading ? 'Updating...' : 'Update Subject'}
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? (
                  'Deleting...'
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Subject
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}