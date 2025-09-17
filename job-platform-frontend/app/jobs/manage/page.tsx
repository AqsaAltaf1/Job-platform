"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { JobsList } from "@/components/jobs/jobs-list"
import { JobForm } from "@/components/jobs/job-form"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth"
import { jobsApi } from "@/lib/jobs"
import type { JobWithCompany } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ManageJobsPage() {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobWithCompany | null>(null)
  const [deletingJob, setDeletingJob] = useState<JobWithCompany | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateJob = () => {
    setShowCreateForm(true)
  }

  const handleEditJob = (job: JobWithCompany) => {
    setEditingJob(job)
  }

  const handleDeleteJob = (job: JobWithCompany) => {
    setDeletingJob(job)
  }

  const confirmDelete = async () => {
    if (!deletingJob) return

    try {
      const result = await jobsApi.deleteJob(deletingJob.id)
      if (result.success) {
        setRefreshKey((prev) => prev + 1) // Trigger refresh
        setDeletingJob(null)
      }
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const handleFormSuccess = () => {
    setShowCreateForm(false)
    setEditingJob(null)
    setRefreshKey((prev) => prev + 1) // Trigger refresh
  }

  return (
    <AuthGuard allowedRoles={["employer", "admin"]}>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Manage Jobs</CardTitle>
                <CardDescription>Create, edit, and manage your job postings</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Jobs List */}
          <JobsList
            key={refreshKey}
            showCreateButton={true}
            showFilters={true}
            postedBy={user?.id}
            onCreateJob={handleCreateJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />

          {/* Create Job Dialog */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <JobForm onSuccess={handleFormSuccess} onCancel={() => setShowCreateForm(false)} />
            </DialogContent>
          </Dialog>

          {/* Edit Job Dialog */}
          <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
              </DialogHeader>
              {editingJob && (
                <JobForm job={editingJob} onSuccess={handleFormSuccess} onCancel={() => setEditingJob(null)} />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deletingJob} onOpenChange={() => setDeletingJob(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingJob?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AuthGuard>
  )
}
