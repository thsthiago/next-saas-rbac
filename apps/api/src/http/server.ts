import fastifyCors from "@fastify/cors"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { fastify } from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from "fastify-type-provider-zod"
import { createAccount } from "./routes/auth/create-account"

const PORT = 3333

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Nest.js Saas",
      description: "Fullstask Saas app with multi-tenancy and RBAC",
      version: "0.0.1"
    },
    servers: [],
    tags: [
      { name: "user", description: "User related end-points" },
      { name: "code", description: "Code related end-points" }
    ]
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})

app.register(fastifyCors)

app.register(createAccount)

app.listen({ port: PORT }).then(() => {
  console.log("HTTP server running!")
})
