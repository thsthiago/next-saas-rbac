import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { getUserPermissions } from "@/utils/get-user-permissions"
import { roleSchema } from "@saas/auth"
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { BadRequestError } from "../_errors/bad-request-error"
import { UnauthorizedError } from "../_errors/unauthorized-error"

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/invites",
      {
        schema: {
          tags: ["Invites"],
          summary: "Create a new invite",
          security: [{ bearerAuth: [] }],
          body: z.object({
            email: z.string().email(),
            role: roleSchema
          }),
          params: z.object({
            slug: z.string()
          }),
          response: {
            201: z.object({
              inviteId: z.string().uuid()
            })
          }
        }
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (!cannot("create", "Invite")) {
          throw new UnauthorizedError(
            `You're not allowed to create a new invite`
          )
        }

        const { email, role } = request.body
        const [, domain] = email.split("@")

        if (
          organization.shouldAttachUserByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            "Users will join your organization automatically on login."
          )
        }

        const inviteWithSomeEmail = await prisma.invite.findUnique({
          where: {
            email_organizationId: {
              email,
              organizationId: organization.id
            }
          }
        })

        if (inviteWithSomeEmail) {
          throw new BadRequestError(
            "Another invite with same e-mail already exists."
          )
        }

        const memberWithSameEmail = await prisma.member.findFirst({
          where: {
            organizationId: organization.id,
            user: { email }
          }
        })

        if (memberWithSameEmail) {
          throw new BadRequestError(
            "A member with this em-amil already belongs to your organization."
          )
        }

        const invite = await prisma.invite.create({
          data: {
            role,
            email,
            authorId: userId,
            organizationId: organization.id
          }
        })

        return reply.status(201).send({
          inviteId: invite.id
        })
      }
    )
}
