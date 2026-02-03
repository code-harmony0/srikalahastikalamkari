import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
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
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: {
        name: "Ananya Rao",
        email: "ananya.rao@example.com",
        phone: "+91 98765 43210",
        address: "H.No 12-4, Banjara Hills, Hyderabad, Telangana - 500034",
        addressLine1: "H.No 12-4, Banjara Hills",
        addressLine2: "",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500034",
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
    }),
    {
      name: 'user-profile-storage',
    }
  )
)
