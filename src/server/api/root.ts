import { createTRPCRouter } from "./trpc";
import { youtubeTitleGenerator } from "./routers/titleGenerator";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  youtube: youtubeTitleGenerator,
});

// export type definition of API
export type AppRouter = typeof appRouter;
