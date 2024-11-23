import { JSXElement, createContext, createSignal, useContext } from 'solid-js'

import { Identity, Ingredient, Recipe } from './types'

import { fetchIngredients as fetchApiIngredients, fetchRecipes as fetchApiRecipes } from './services'
import { formatError } from './utils'

export type AppState = {
  identity: Identity | undefined
  ingredients: Record<number, Ingredient> | undefined
  recipes: Record<number, Recipe> | undefined
  error?: any
}

const INITIAL_STATE: AppState = {
  identity: undefined,
  ingredients: undefined,
  recipes: undefined
}

const [state, setState] = createSignal(INITIAL_STATE)

const setRecipes = (recipes: Recipe[]) => {
  setState({
    ...state(),
    recipes: {
      ...Object.fromEntries(recipes.map(recipe => [recipe.id, recipe]))
    }
  })
}

const setIngredients = (ingredients: Ingredient[]) => {
  setState({
    ...state(),
    ingredients: {
      ...Object.fromEntries(ingredients.map(ingredient => [ingredient.id, ingredient]))
    }
  })
}

const setError = (error?: any) => {
  console.error(error)

  setState({
    ...state(),
    error
  })
}

const fetchRecipes = async (opts: { refetching: boolean }): Promise<Record<number, Recipe>> => {
  try {
    const recipes = state().recipes

    // check if we currently have the ingredients or force fetch
    if (recipes && !opts.refetching) {
      return recipes!
    }

    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    const result = await fetchApiRecipes(identity!)
    setRecipes(result)

    return result
  } catch (e) {
    setError(formatError('Error while fetching detailed group', e))
    const recipes = state().recipes!
    return recipes
  }
}

const fetchIngredients = async (opts: { refetching: boolean }): Promise<Record<number, Ingredient>> => {
  try {
    const ingredients = state().ingredients

    // check if we currently have the ingredients or force fetch
    if (ingredients && !opts.refetching) {
      return ingredients!
    }

    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    const result = await fetchApiIngredients(identity!)
    setIngredients(result)

    return result
  } catch (e) {
    setError(formatError('Error while fetching detailed group', e))
    const ingredients = state().ingredients
    return ingredients!
  }
}

const appState = [state, { setState, setError, setIngredients, setRecipes, fetchIngredients, fetchRecipes }] as const

const AppContext = createContext<typeof appState>()

export const Provider = (props: { children: JSXElement }) => (
  <AppContext.Provider value={appState}>{props.children}</AppContext.Provider>
)

export const useAppContext = () => useContext(AppContext)!
