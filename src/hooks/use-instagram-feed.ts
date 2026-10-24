"use client";

import { useQuery } from "@tanstack/react-query";
import { instagramService } from "@/services/instagram.service";

export function useInstagramFeed() {
    return useQuery({
        queryKey: ["instagram-feed"],
        queryFn: () => instagramService.getFeed(),
        staleTime: 60_000,
        retry: 1,
    });
}
