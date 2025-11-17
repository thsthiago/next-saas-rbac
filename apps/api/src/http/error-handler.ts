import { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { BadRequestError } from "./routes/_errors/bad-request-error"
import { NotFoundError } from "./routes/_errors/not-found"
import { UnauthorizedError } from "./routes/_errors/unauthorized-error"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: error.message,
      code: "ValidationError",
      errors: error.flatten().fieldErrors
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({ message: error.message, code: error.name })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ message: error.message, code: error.name })
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({ message: error.message, code: error.name })
  }

  return reply
    .status(500)
    .send({ message: "Internal server error", code: "InternalServerError" })
}
