import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const entryRouter = createTRPCRouter({
  createEntry: protectedProcedure
    .input(z.object({ content: z.string().min(2), topicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const insertEntry = await ctx.prisma.entry.create({
        data: {
          user: { connect: { id: ctx.session?.user?.id } },
          topic: { connect: { id: input.topicId } },
          content: input.content,
        },
      });

      if (insertEntry) {
        const checkUserLiked = await ctx.prisma.favorites.create({
          data: {
            entry: { connect: { id: insertEntry.id } },
            user: { connect: { id: ctx.session?.user?.id } },
          },
        });
        return { data: { success: true, message: "entry is created" } };
      } else {
        return { data: { success: false, message: "entry is not created" } };
      }
    }),
  getEntries: publicProcedure
    .input(z.string().nullable())
    .query(async ({ ctx, input }) => {
      if (input) {
        const findEntrysAndTopic = await ctx.prisma.entry.findMany({
          where: {
            topic: {
              topicTitle: input || "",
            },
          },
          select: {
            content: true,
            topic: true,
            id: true,
            createdAt: true,
            user: {
              select: {
                avatar: true,
                name: true,
                id: true,
              },
            },
          },
        });
        if (findEntrysAndTopic) {
          return findEntrysAndTopic;
        } else {
          return null;
        }
      }
    }),
  getUserEntries: protectedProcedure.query(async ({ ctx }) => {
    const findEntryAndTopic = await ctx.prisma.entry.findMany({
      include: {
        topic: true,
        favorites: true,
        user: {
          select: {
            avatar: true,
            name: true,
            id: true,
            email: true,
          },
        },
      },
    });
    if (findEntryAndTopic) {
      return findEntryAndTopic;
    } else {
      return null;
    }
  }),
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const findFavoritedEntries = await ctx.prisma.entry.findMany({
      where: {
        favorites: {
          some: {
            favorite: true,
          },
        },
      },
      include: {
        topic: true,
        favorites: true,
        user: {
          select: {
            avatar: true,
            name: true,
            id: true,
            email: true,
          },
        },
      },
    });
    if (findFavoritedEntries) {
      return findFavoritedEntries;
    } else {
      return null;
    }
  }),
  getInfitineEntries: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        take: z.number(),
        topicTitle: z.string().nullish(),
        skip: z.number().optional(),
      })
    )

    .query(async ({ ctx, input }) => {
      console.time("test");
      const { take, skip, topicTitle } = input;
      console.log("🚀 ~ file: entry.ts:125 ~ .query ~ input:", input);
      const [infiniteEntries, totalCount] = await ctx.prisma.$transaction([
        ctx.prisma.entry.findMany({
          take: take,
          skip: skip,
          where: {
            topic: {
              topicTitle: topicTitle || "",
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            favorites: {
              select: {
                id: true,
                favorite: true,
                entryId: true,
              },
            },
            topic: {
              select: {
                topicTitle: true,
                id: true,
              },
            },
            user: {
              select: {
                id: true,
                avatar: true,
                email: true,
                name: true,
              },
            },
          },
        }),
        ctx.prisma.entry.count({
          where: {
            topic: {
              topicTitle: topicTitle || "",
            },
          },
        }),
      ]);
      console.timeEnd("test");

      return {
        infiniteEntries,
        totalCount,
      };
    }),
  updateEntry: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        content: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.userId) {
        const updateSingleEntry = await ctx.prisma.entry.update({
          where: {
            id: input.entryId,
          },
          data: {
            content: input.content,
          },
        });
        if (updateSingleEntry) {
          return { success: true, message: "entry is updated" };
        } else {
          return { success: false, message: "entry is not updated" };
        }
      }
    }),
  removeEntry: protectedProcedure
    .input(z.string().nullable())
    .mutation(async ({ ctx, input }) => {
      if (input != null) {
        const removeSingleEntry = await ctx.prisma.entry.deleteMany({
          where: {
            id: input,
            userId: ctx.session.user.id,
          },
        });
        if (removeSingleEntry.count > 0) {
          return {
            success: true,
            message: "entry is removed",
            count: removeSingleEntry.count,
          };
        } else {
          return {
            success: false,
            message: "entry is not removed",
            count: removeSingleEntry.count,
          };
        }
      } else {
        return { success: false, message: "entry is not removed" };
      }
    }),
});
