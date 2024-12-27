import { For, Match, Switch, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useSearchParams } from '@solidjs/router'

import { search } from '../services'
import { Kind, Result, State } from '../types'
import { useAppContext } from '../context'
import { decodeArgument, useNavigateUtils } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'
import { RecipeComponent } from '../components/RecipeComponent'

import appStyles from '../App.module.css'

export default () => {
  const [state, { fetchIngredients, fetchRecipes }] = useAppContext()

  onMount(() => {
    refreshAll(false)
  })

  const refreshAll = async (refetching: boolean = true) => {
    fetchIngredients({ refetching })
    fetchRecipes({ refetching })
  }

  const navigate = useNavigate()
  const { searchTag } = useNavigateUtils(navigate)

  const [searchParams] = useSearchParams()

  const [results, setResults] = createSignal<Result[] | undefined>()

  createEffect(async () => {
    if (!state().recipes || !state().ingredients) {
      return
    }

    const keywords = decodeArgument(searchParams.keywords)
    const states = decodeArgument(searchParams.states) as State[]
    const kinds = decodeArgument(searchParams.kinds) as Kind[]

    const searchOptions = {
      keywords,
      states,
      kinds
    }

    const results = await search(searchOptions)

    const merged = results.map(r => {
      return r.kind === 'recipe' && state().recipes && state().recipes![r.recipe as any]
        ? { kind: 'recipe', recipe: state().recipes![r.recipe as unknown as number] }
        : r.kind === 'ingredient' && state().ingredients && state().ingredients![r.ingredient as any]
          ? { kind: 'ingredient', ingredient: state().ingredients![r.ingredient as unknown as number] }
          : { kind: 'loading' }
    })

    setResults(merged)
  })

  return (
    <div class={appStyles['main-page']}>
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
