"use client"

import React from "react"
import Link, { LinkProps } from "next/link"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useAuthModalStore } from "@/shared/auth-modal-store"

interface AuthGuardedLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
}

export function AuthGuardedLink({ children, className, href, ...props }: AuthGuardedLinkProps) {
  const { user, loading: authLoading } = useAuth()
  const { openModal } = useAuthModalStore()

  const handleClick = (e: React.MouseEvent) => {
    if (authLoading) {
      e.preventDefault()
      return
    }
    if (!user) {
      e.preventDefault()
      openModal(href.toString())
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  )
}
