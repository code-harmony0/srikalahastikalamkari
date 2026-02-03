/**
 * React Query hooks for promotions
 */

import { useQuery } from "@tanstack/react-query";
import { promotionsService } from "@/services/promotions";

export function useActivePromotions() {
  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: () => promotionsService.getActive(),
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionsService.getAll(),
  });
}
