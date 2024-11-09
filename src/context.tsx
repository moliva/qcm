import { JSXElement, createContext, createSignal, useContext } from 'solid-js'

import { Currency, DetailedGroup, Identity, Ingredient } from './types'

export type AppState = {
  identity: Identity | undefined
  ingredients: Record<number, Ingredient> | undefined
  currencies: Record<number, Currency>
  error?: any
}

const INITIAL_STATE: AppState = {
  identity: undefined,
  ingredients: undefined,
  currencies: {}
}

const [state, setState] = createSignal(INITIAL_STATE)

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

const appState = [state, { setState, setError, setIngredients }] as const

const AppContext = createContext<typeof appState>()

export const Provider = (props: { children: JSXElement }) => (
  <AppContext.Provider value={appState}>{props.children}</AppContext.Provider>
)

export const useAppContext = () => useContext(AppContext)!
