"use client";

import { useQuery } from "@tanstack/react-query";
import { megaMenuService } from "@/services/mega-menu.service";
import type { MegaMenu } from "@/types/mega-menu";

export function useMegaMenu() {
  return useQuery<MegaMenu>({
    queryKey: ["mega-menu"],
    queryFn: () => megaMenuService.getMegaMenu(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
