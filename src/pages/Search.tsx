import { For, Match, Switch, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useSearchParams } from '@solidjs/router'

import { fetchIngredients as fetchApiIngredients, fetchRecipes as fetchApiRecipes, search } from '../services'
import { Ingredient, Recipe, Result } from '../types'
import { useAppContext } from '../context'
import { decodeArgument, formatError, useNavigateUtils } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'
import { RecipeComponent } from '../components/RecipeComponent'

import styles from './Search.module.css'

export default () => {
  const navigate = useNavigate()
  const { searchTag } = useNavigateUtils(navigate)

  const [searchParams, setSearchParams] = useSearchParams()

  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

  const [results, setResults] = createSignal<Result[] | undefined>()

  createEffect(async () => {
    const keywords = decodeArgument(searchParams.keywords)
    const states = decodeArgument(searchParams.states)
    const kinds = decodeArgument(searchParams.kinds)

    const searchOptions = {
      keywords,
      states,
      kinds
    }

    const results = await search(state().identity!, searchOptions)

    const merged = results.map(r => {
      return r.kind === 'recipe' && state().recipes && state().recipes![r.recipe as any]
        ? { kind: 'recipe', recipe: state().recipes![r.recipe as unknown as number] }
        : r.kind === 'ingredient' && state().ingredients && state().ingredients![r.ingredient as any]
          ? { kind: 'ingredient', ingredient: state().ingredients![r.ingredient as unknown as number] }
          : { kind: 'loading' }
    })

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
  })

  return (
    <div class={styles.main}>
      <Switch fallback={<p>Loading...</p>}>
        <Match when={results()?.length === 0}>
          <p style={{ 'font-style': 'italic', color: 'grey' }}>
            No results for '{decodeURI(searchParams.keywords)}' for the current filtering options
          </p>
        </Match>
        <Match when={results() !== undefined && results()!.length > 0}>
          <For each={results()}>
            {result =>
              result.kind === 'loading' ? null : result.kind === 'ingredient' ? (
                <IngredientComponent
                  ingredient={result.ingredient}
                  onTagClicked={searchTag}
                  onNameClick={() => {
                    navigate(import.meta.env.BASE_URL + `ingredients/${result.ingredient.id}`)
                  }}
                  onRelatedIngredientClicked={id => navigate(import.meta.env.BASE_URL + `ingredients/${id}`)}
                />
              ) : (
                <RecipeComponent
                  recipe={result.recipe}
                  onTagClicked={searchTag}
                  onNameClick={() => {
                    navigate(import.meta.env.BASE_URL + `recipes/${result.recipe.id}`)
                  }}
                />
              )
            }
          </For>
        </Match>
      </Switch>
    </div>
  )
}
