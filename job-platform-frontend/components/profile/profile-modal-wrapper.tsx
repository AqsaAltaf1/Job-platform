"use client"

import { useAuth } from "@/lib/auth"
import { ProfileEditModal } from "./profile-edit-modal"

interface ProfileModalWrapperProps {
  onProfileSave?: () => void
}

export function ProfileModalWrapper({ onProfileSave }: ProfileModalWrapperProps) {
  const { showProfileModal, setShowProfileModal, refreshUser } = useAuth()

  const handleClose = () => {
    setShowProfileModal(false)
  }

  const handleSave = async () => {
    try {
      // Refresh user data to get the latest profile information
      await refreshUser()
      
      // Call the parent's profile save handler if provided
      if (onProfileSave) {
        onProfileSave()
      }
      
      // Profile saved successfully, modal will close automatically
      setShowProfileModal(false)
    } catch (error) {
      console.error('Failed to refresh user data after profile save:', error)
      // Still close the modal even if refresh fails
      setShowProfileModal(false)
    }
  }

  return (
    <ProfileEditModal
      isOpen={showProfileModal}
      onClose={handleClose}
      onSave={handleSave}
    />
  )
}
