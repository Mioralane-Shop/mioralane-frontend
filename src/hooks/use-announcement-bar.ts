"use client";

import { useQuery } from "@tanstack/react-query";
import { announcementService } from "@/services/announcement.service";

export function useAnnouncementBar() {
    return useQuery({
        queryKey: ["announcement-bar"],
        queryFn: () => announcementService.getAnnouncementBar(),
        staleTime: 60_000,
        retry: 1,
    });
}
