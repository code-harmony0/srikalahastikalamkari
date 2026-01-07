"use client"

import * as React from "react"
import { toast as sonnerToast, type ToastT } from "sonner"
import { useCallback, useState } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive" | "warning" | "info"
  duration?: number
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ id = Math.random()
      .toString(36)
      .substring(2, 9), title, description, variant = "default", duration = 5000, action }: Omit<ToastProps, "id"> & { id?: string }) => {
    const toastId = id

    // Add to local state
    setToasts((prev) => [
      ...prev,
      { id: toastId, title, description, variant, duration, action },
    ])

    // Show with sonner
    const toastProps = {
      id: toastId,
      duration,
      onDismiss: () => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId))
      },
    }

    switch (variant) {
      case "success":
        return sonnerToast.success(title, { ...toastProps, description })
      case "destructive":
        return sonnerToast.error(title, { ...toastProps, description })
      case "warning":
        return sonnerToast.warning(title, { ...toastProps, description })
      case "info":
        return sonnerToast.info(title, { ...toastProps, description })
      default:
        return sonnerToast(title, { ...toastProps, description })
    }
  }, [])

  return { toasts, toast }
}
