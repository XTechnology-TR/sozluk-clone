import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const favoriteRouter = createTRPCRouter({
  ceateFavorite: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        favoriteId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { entryId, favoriteId } = input;
      const isFavoriteExist = await ctx.prisma.favorites.findFirst({
        where: {
          entryId: entryId,
          id: favoriteId,
          userId: ctx.session?.user?.id,
        },
        select: {
          favorite: true,
          id: true,
        },
      });
      if (!isFavoriteExist) {
        const ceateFavorite = await ctx.prisma.favorites.create({
          data: {
            user: { connect: { id: ctx.session?.user?.id } },
            entry: { connect: { id: entryId } },
            favorite: true,
          },
        });
      } else {
        const removeFavorite = await ctx.prisma.entry.update({
          where: {
            id: entryId,
          },
          data: {
            favorites: {
              delete: {
                id: isFavoriteExist.id,
              },
            },
          },
        });
      }
    }),

  getFavorites: publicProcedure
    .input(z.object({ userName: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userName } = input;
      const findFavoritedEntries = await ctx.prisma.entry.findMany({
        where: {
          favorites: {
            some: {
              user: {
                name: userName,
              },
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
});
