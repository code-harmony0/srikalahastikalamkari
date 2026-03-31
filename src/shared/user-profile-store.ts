import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  _ownerId: string  // Firebase UID - tracks which user's data this is
  name: string
  email: string
  phone: string
  address: string
  // Split address fields for detailed editing
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface UserProfileStore {
  profile: UserProfile
  updateProfile: (data: Partial<UserProfile>) => void
  resetForUser: (ownerId: string) => void
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: {
        _ownerId: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      },
      updateProfile: (data) =>
        set((state) => {
            // Construct full address if individual fields are updated
            let newAddress = state.profile.address;
            const merged = { ...state.profile, ...data };

            if (data.addressLine1 || data.city || data.state || data.postalCode) {
                const parts = [
                    merged.addressLine1,
                    merged.addressLine2,
                    merged.city,
                    merged.state,
                    merged.postalCode
                ].filter(Boolean);
                if (parts.length > 0) {
                     newAddress = parts.join(", ");
                }
            }

            return {
                profile: {
                    ...merged,
                    address: newAddress
                }
            }
        }),
      resetForUser: (ownerId) =>
        set({
          profile: {
            _ownerId: ownerId,
            name: "",
            email: "",
            phone: "",
            address: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
          }
        }),
    }),
    {
      name: 'user-profile-storage',
    }
  )
)
