import { JSXElement, createContext, createSignal, useContext } from 'solid-js'

import { Currency, DetailedGroup, Identity, Ingredient, Recipe } from './types'

export type AppState = {
  identity: Identity | undefined
  ingredients: Record<number, Ingredient> | undefined
  recipes: Record<number, Recipe> | undefined
  currencies: Record<number, Currency>
  error?: any
}

const INITIAL_STATE: AppState = {
  identity: undefined,
  ingredients: undefined,
  recipes: undefined,
  currencies: {}
}

const [state, setState] = createSignal(INITIAL_STATE)

const setRecipes = (recipes: Recipe[]) => {
  setState({
    ...state(),
    recipes: {
      ...state().recipes,
      ...Object.fromEntries(recipes.map(recipe => [recipe.id, recipe]))
    }
  })
}

const setIngredients = (ingredients: Ingredient[]) => {
  setState({
    ...state(),
    ingredients: {
      ...state().ingredients,
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

const appState = [state, { setState, setError, setIngredients, setRecipes }] as const

const AppContext = createContext<typeof appState>()

export const Provider = (props: { children: JSXElement }) => (
  <AppContext.Provider value={appState}>{props.children}</AppContext.Provider>
)

export const useAppContext = () => useContext(AppContext)!
