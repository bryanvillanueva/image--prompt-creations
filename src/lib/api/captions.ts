import { api } from "./client";
import type { CaptionMessage, CaptionThread, SocialPlatform } from "../types";

/** `platforms` is context for the copywriter only — it doesn't change where the post goes. */
type TurnResponse = CaptionMessage[] | { messages: CaptionMessage[] };

export const captionsApi = {
  /**
   * Idempotent: creates the thread and its first assistant turn, or returns the
   * existing history. Safe to call on every dialog open.
   */
  openThread: (brandId: number, generationId: number, platforms?: SocialPlatform[]) =>
    api.post<CaptionThread>(
      `/brands/${brandId}/generations/${generationId}/caption-thread`,
      platforms?.length ? { platforms } : undefined,
    ),

  /**
   * Same contract as `openThread`, but the copywriter receives the whole
   * carousel (arc + printed texts). The carousel must be `completed`.
   */
  openCarouselThread: (brandId: number, carouselId: number, platforms?: SocialPlatform[]) =>
    api.post<CaptionThread>(
      `/brands/${brandId}/carousels/${carouselId}/caption-thread`,
      platforms?.length ? { platforms } : undefined,
    ),

  /** Returns just this turn ([user, assistant]) to append to the local history. */
  sendMessage: async (
    brandId: number,
    threadId: number,
    content: string,
    platforms?: SocialPlatform[],
  ): Promise<CaptionMessage[]> => {
    const res = await api.post<TurnResponse>(`/brands/${brandId}/caption-threads/${threadId}/messages`, {
      content,
      ...(platforms?.length ? { platforms } : {}),
    });
    // Accepts both `data: [...]` and `data: { messages: [...] }`.
    const payload = res.data;
    return Array.isArray(payload) ? payload : (payload?.messages ?? []);
  },
};
