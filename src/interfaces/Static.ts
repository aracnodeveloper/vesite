export interface StaticUpdateDto {
    videoUrl?: string;
    videoTitle?: string;
    musicEmbedUrl?: string;
    musicNote?: string;
    socialPost?: {
        text?: string;
        mediaUrl?: string;
    };
}