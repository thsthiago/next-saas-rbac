import { defineAbilityFor } from "@saas/auth"

const ability = defineAbilityFor({ role: "MEMBER", id: "1" })

const userCanInviteSomeoneElse = ability.can("invite", "User")
const userCanDeleteOtherUser = ability.can("delete", "User")
const userCannotDeleteOtherUser = ability.cannot("get", "Billing")
