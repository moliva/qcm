import { For, Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams, useSearchParams } from '@solidjs/router'

import {
  deleteIngredient,
  fetchIngredients as fetchApiIngredients,
  fetchRecipes as fetchApiRecipes,
  postIngredient,
  putIngredient,
  search
} from '../services'
import { Ingredient, Recipe, Result } from '../types'
import { useAppContext } from '../context'
import { formatError } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Search.module.css'
import EditIngredientComponent from '../components/EditIngredientComponent'
import { RecipeComponent } from '../components/RecipeComponent'

export default () => {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

  const [results, setResults] = createSignal<Result[] | undefined>()

  const [showIngredientModal, setShowIngredientModal] = createSignal(false)

  function decodeArgument(arg: string | undefined): string[] {
    return arg ? decodeURI(arg).split(' ') : []
  }

  createEffect(async () => {
    const keywords = decodeArgument(searchParams.keywords)
    const states = decodeArgument(searchParams.states)
    const kinds = decodeArgument(searchParams.kinds)
    console.log(keywords, states, kinds)

    const searchOptions = {
      keywords,
      states,
      kinds
    }

    const results = await search(state().identity!, searchOptions)
    console.log('results', results)
    const merged = results.map(r => {
      return r.kind === 'recipe' && state().recipes
        ? { kind: 'recipe', recipe: state().recipes![r.recipe as unknown as number] }
        : r.kind === 'ingredient' && state().ingredients
          ? { kind: 'ingredient', ingredient: state().ingredients![r.ingredient as unknown as number] }
          : 'loading'
    })
    console.log('merged', merged)

    setResults(merged)
  })

  const fetchRecipes = async (opts: { refetching: boolean }): Promise<Record<number, Recipe>> => {
    try {
      const recipes = state().recipes

      // check if we currently have the ingredients or force fetch
      if (!opts.refetching) {
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
      if (!opts.refetching) {
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

  const refreshContent = async () => {
    try {
      const currentIdentity = state().identity!
      fetchIngredients({ refetching: true })
      fetchRecipes({ refetching: true })
    } catch (e) {
      setError(formatError('Error while refreshing content', e))
      throw e
    }
  }

  let alreadyFetch = false
  createEffect(async () => {
    if (!alreadyFetch) {
      if (!state().ingredients) {
        alreadyFetch = true
        try {
          await refreshContent()
        } catch (e) {
          // put back to false due to error thrown
          alreadyFetch = false
        }
      }
    }
  })

  const refreshAll = async () => {
    fetchIngredients({ refetching: true })
    fetchRecipes({ refetching: true })
  }

  onMount(() => {
    fetchIngredients({ refetching: false })
    fetchRecipes({ refetching: false })

    console.log('search query', searchParams.keywords)
  })

  return (
    <div class={styles.main}>
      {results() ? (
        <For each={results()}>
          {result =>
            result.kind === 'ingredient' ? (
              <IngredientComponent
                ingredient={result.ingredient}
                onEdit={() => {}}
                onDelete={() => {}}
                onRelatedIngredientClicked={() => {}}
              />
            ) : (
              <RecipeComponent
                recipe={result.recipe}
                onEdit={() => {}}
                onDelete={() => {}}
                onRelatedRecipeClicked={() => {}}
              />
            )
          }
        </For>
      ) : (
        'Loading'
      )}
    </div>
  )
}
