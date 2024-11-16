
export type UserId = string

export type NotificationStatus = 'new' | 'read' | 'archived'

export type NotificationsUpdate = NotificationUpdate & { ids: number[] }

export type NotificationUpdate = {
  status: NotificationStatus
}

export type NotificationAction = 'joined' | 'rejected'
export type MembershipStatus = 'joined' | 'rejected' | 'pending'

export type State = 'bad' | 'good' | 'warning' | 'unknown'

export type Ingredient = {
  id: number | undefined
  name: string
  created_at?: string | undefined

  state: State
  tags: string[]
  notes: string

  related: number[]
  recipes: number[]
}

/** Ingredient id -> measure to be used in recipe */
export type IngredientPair = { ingredient: number; measure: string }

export type Recipe = {
  id: number | undefined
  name: string
  created_at?: string | undefined

  state: State
  tags: string[]
  notes: string

  ingredients: IngredientPair[]
}

export type UserStatus = 'active' | 'inactive'

export type User = {
  id: string
  email: string
  status: UserStatus
  name: string
  picture: string
}

export type Identity = {
  identity: { name: string; picture: string; email: string }
  token: string
}

export type IdentityState = Identity | undefined
