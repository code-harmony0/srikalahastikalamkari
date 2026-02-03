/**
 * Promotions Service - Mock implementation replacing Wix Data API
 */

import { Promotion } from "@/shared/types";

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Summer Sale",
    description: "Get 20% off on all Kalamkari products",
    bannerImage: "/images/promotions/promo-1.png",
    callToActionUrl: "/products",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
    _createdDate: new Date("2025-01-01T00:00:00.000Z"),
    _updatedDate: new Date("2025-01-01T00:00:00.000Z"),
  },
  {
    id: "2",
    title: "New Collection",
    description: "Discover our latest handcrafted Kalamkari sarees",
    bannerImage: "/images/promotions/promo-2.png",
    callToActionUrl: "/products",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
    _createdDate: new Date("2025-01-01T00:00:00.000Z"),
    _updatedDate: new Date("2025-01-01T00:00:00.000Z"),
  },
];

export const promotionsService = {
  async getActive(): Promise<Promotion[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPromotions.filter(p => p.isActive);
  },

  async getAll(): Promise<Promotion[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPromotions;
  },
};
