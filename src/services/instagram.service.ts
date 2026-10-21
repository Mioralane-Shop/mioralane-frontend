import api from "@/lib/axios";
import type { InstagramFeedVideo } from "@/types/instagram";

export const instagramService = {
    /**
     * The admin-selected homepage reels, in display order. Everything is
     * served from MongoDB — the storefront never talks to Meta directly.
     */
    async getFeed(): Promise<InstagramFeedVideo[]> {
        const { data } = await api.get<{ success: boolean; videos: InstagramFeedVideo[] }>(
            "/instagram/feed",
        );
        return data.videos ?? [];
    },
};
