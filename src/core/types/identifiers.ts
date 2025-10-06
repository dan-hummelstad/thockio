
type Branded<T, Brand> = T & { readonly __brand: Brand }

export type EntityId = Branded<string, "EntityId">
export type SpaceId = Branded<string, "SpaceId">

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isEntityId = (value: unknown): value is EntityId =>
  typeof value === 'string' && value.length > 0 && value.startsWith("ent_") && UUID_REGEX.test(value.split("ent_")[1])

export const isSpaceId = (value: unknown): value is SpaceId =>
  typeof value === 'string' && value.length > 0 && value.startsWith("spc_") && UUID_REGEX.test(value.split("spc_")[1])

function generateId(prefix: "ent_" | "spc_"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  for (let i = 0; i < 25; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}${id}`
}

export const createEntityId = (): EntityId => generateId("ent_") as EntityId
export const createSpaceId = (): SpaceId => generateId("spc_") as SpaceId