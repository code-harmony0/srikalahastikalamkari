/**
 * useAuthGuardedAction
 *
 * A reusable hook that wraps any action with an authentication check.
 * If the user is not logged in (and Firebase has finished loading),
 * it opens the AuthModal instead of performing the action.
 *
 * Usage:
 *   const guardedAddToCart = useAuthGuardedAction(() => cart.addItem(product, 1))
 *   <button onClick={guardedAddToCart}>Add to Cart</button>
 */
"use client"

import { useCallback } from "react"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useAuthModalStore } from "@/shared/auth-modal-store"

type GuardedActionOptions = {
  /** URL to redirect to after successful login. Defaults to current path. */
  redirectUrl?: string
}

export function useAuthGuardedAction<T extends any[]>(
  action: (e?: React.MouseEvent | any, ...args: T) => void,
  options: GuardedActionOptions = {}
) {
  const { user, loading: authLoading } = useAuth()
  const { openModal } = useAuthModalStore()

  return useCallback(
    (e?: React.MouseEvent | any, ...args: T) => {
      // Stop event bubbling in all cases (prevents card Link navigation on button clicks)
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault()
      }
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation()
      }

      // Auth still resolving from Firebase — do nothing (not yet safe to check)
      if (authLoading) return

      // Definitely not logged in — open modal
      if (!user) {
        openModal(options.redirectUrl)
        return
      }

      // Authenticated — perform the action
      action(e, ...args)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, authLoading, action, openModal, options.redirectUrl]
  )
}
