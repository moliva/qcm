import { Identity, authentifiedFetch, setApiHost } from '@moliva/auth.ts'

import { Ingredient, Recipe, Result, SearchOptions } from './types'

export const API_HOST = import.meta.env.VITE_API_URL

setApiHost(API_HOST)

// *****************************************************************************************************
// *************** search ***************
// *****************************************************************************************************

function encodeSearchOptions(searchOptions: SearchOptions): string {
  const keywords = searchOptions.keywords.length > 0 ? 'keywords=' + searchOptions.keywords.join(',') : undefined
  const states = searchOptions.states.length > 0 ? 'states=' + searchOptions.states.join(',') : undefined
  const kinds = searchOptions.kinds.length > 0 ? 'kinds=' + searchOptions.kinds.join(',') : undefined

  const populated = [keywords, states, kinds].filter(populate => populate !== undefined)

  return populated.join('&')
}

export async function search(identity: Identity, searchOptions: SearchOptions): Promise<Result[]> {
  const query = encodeSearchOptions(searchOptions)
  const res = await authentifiedFetch(`${API_HOST}/search?${query}`)

  return (await res.json()) as Result[]
}

// *****************************************************************************************************
// *************** recipes ***************
// *****************************************************************************************************

export async function fetchRecipes(identity: Identity): Promise<Recipe[]> {
  const res = await authentifiedFetch(`${API_HOST}/recipes`)

  return (await res.json()) as Recipe[]
}

export async function postRecipe(recipe: Recipe, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/recipes`, {
    method: 'POST',
    body: JSON.stringify(recipe),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function putRecipe(recipe: Recipe, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/recipes/${recipe.id}`, {
    method: 'PUT',
    body: JSON.stringify(recipe),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteRecipe(recipe: Recipe, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/recipes/${recipe.id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}

// *****************************************************************************************************
// *************** ingredients ***************
// *****************************************************************************************************

export async function fetchIngredients(identity: Identity): Promise<Ingredient[]> {
  const res = await authentifiedFetch(`${API_HOST}/ingredients`)

  return (await res.json()) as Ingredient[]
}

export async function postIngredient(ingredient: Ingredient, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/ingredients`, {
    method: 'POST',
    body: JSON.stringify(ingredient),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function putIngredient(ingredient: Ingredient, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/ingredients/${ingredient.id}`, {
    method: 'PUT',
    body: JSON.stringify(ingredient),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteIngredient(ingredient: Ingredient, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/ingredients/${ingredient.id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}
