"use client"

import { useAuth } from "@/lib/auth"
import { ProfileEditModal } from "./profile-edit-modal"

export function ProfileModalWrapper() {
  const { showProfileModal, setShowProfileModal } = useAuth()

  const handleClose = () => {
    setShowProfileModal(false)
  }

  const handleSave = () => {
    // Profile saved successfully, modal will close automatically
    setShowProfileModal(false)
  }

  return (
    <ProfileEditModal
      isOpen={showProfileModal}
      onClose={handleClose}
      onSave={handleSave}
    />
  )
}
