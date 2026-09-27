export type AnnouncementAnimation = "slide" | "fade" | "marquee";
export type AnnouncementDirection = "ltr" | "rtl";
export type AnnouncementBackground = "solid" | "sheen" | "gradient";

export type AnnouncementMessage = {
    text: string;
    url?: string;
};

/** Admin-managed storefront top ticker */
export type AnnouncementBar = {
    enabled: boolean;
    messages: AnnouncementMessage[];
    animation: AnnouncementAnimation;
    direction: AnnouncementDirection;
    /** Colour treatment of the strip itself. */
    background: AnnouncementBackground;
    backgroundColor: string;
    textColor: string;
    intervalSeconds: number;
    speedSeconds: number;
};
