/** One featured reel as served by `GET /api/instagram/feed`. */
export type InstagramFeedVideo = {
    id: string;
    permalink?: string;
    caption?: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
    timestamp?: string;
};
