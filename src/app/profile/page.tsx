import { Metadata } from "next";
import ProfilePage from "@/storefront/pages/ProfilePage";

export const metadata: Metadata = {
  title: "My Profile | Shri Kailash Kalamkari",
  description: "Manage your account and orders",
};

export default function Profile() {
  return <ProfilePage />;
}
