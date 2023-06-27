import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/api";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};
export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100, // takes only the first 100 posts from the user
      orderBy: [{ createdAt: "desc" }],
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100, // limits the number users being returned from the clerk client
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      {
        const author = users.find((user) => user.id === post.authorId);
        if (!author || !author.username) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author post not found ❌",
          });
        }
        return {
          post,
          author: {
            ...author,
            username: author.username,
          },
        };
      }
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
