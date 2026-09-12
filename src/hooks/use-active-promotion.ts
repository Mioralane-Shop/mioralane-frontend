"use client";

import { useQuery } from "@tanstack/react-query";
import { promotionService } from "@/services/promotion.service";

export function useActivePromotion() {
  return useQuery({
    queryKey: ["active-promotion"],
    queryFn: () => promotionService.getActive(),
    staleTime: 60_000,
    retry: 1,
  });
}
