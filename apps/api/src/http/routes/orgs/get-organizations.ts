import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { roleSchema } from "@saas/auth"
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function getOrgationzations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Get organizations where user is a member",
          security: [{ bearerAuth: [] }],
          params: z.object({ slug: z.string() }),
          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                  role: roleSchema
                })
              )
            })
          }
        }
      },
      async (request) => {
        const userId = await request.getCurrentUserId()
        const organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            members: {
              select: {
                role: true
              },
              where: { userId }
            }
          },
          where: {
            members: {
              some: {
                userId
              }
            }
          }
        })

        const organizationsWithRole = organizations.map(
          ({ members, ...org }) => {
            return {
              ...org,
              role: members[0].role
            }
          }
        )

        return { organizations: organizationsWithRole }
      }
    )
}
