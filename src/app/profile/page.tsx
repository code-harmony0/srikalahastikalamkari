import { Metadata } from "next";
import ProfilePage from "@/features/pages/ProfilePage";

export const metadata: Metadata = {
  title: "My Profile | Srikalahasti Kalamkari",
  description: "Manage your account and orders",
};

export default function Profile() {
  return <ProfilePage />;
}
