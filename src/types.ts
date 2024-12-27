import { Identity } from '@moliva/auth.ts'

export type UserId = string

export type IngredientId = number
export type RecipeId = number

export type State = 'bad' | 'good' | 'warning' | 'unknown'

export type Ingredient = {
  id: IngredientId | undefined
  name: string
  created_at?: string | undefined

  state: State
  tags: string[]
  notes: string

  related: IngredientId[]
  recipes: RecipeId[]
}

export type Kind = 'recipe' | 'ingredient'

/** Ingredient id -> measure to be used in recipe */
export type IngredientPair = {
  ingredient: IngredientId
  measure: string
}

export type SearchOptions = {
  keywords: string[]
  states: State[] // subset of possible states: good, bad, warning, unknown
  kinds: Kind[] // subset of possible kinds: recipe, ingredient
}

export type Result =
  | {
      kind: 'ingredient'
      ingredient: Ingredient
    }
  | {
      kind: 'recipe'
      recipe: Recipe
    }

export type Recipe = {
  id: RecipeId | undefined
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

export type IdentityState = Identity | undefined
