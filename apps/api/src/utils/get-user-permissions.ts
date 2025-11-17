import { Role } from "@prisma/client"
import { defineAbilityFor, userSchema } from "@saas/auth"

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role: role
  })

  return defineAbilityFor(authUser)
}
