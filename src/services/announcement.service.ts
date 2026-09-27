import api from "@/lib/axios";
import type { AnnouncementBar } from "@/types/announcement";

export const announcementService = {
    /** Announcement bar (top ticker) configured in the admin panel */
    async getAnnouncementBar() {
        const { data } = await api.get<{ success: boolean; announcement: AnnouncementBar }>(
            "/announcements",
        );
        return data.announcement;
    },
};
