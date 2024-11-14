import { For, Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import { faPlusSquare, faRotateRight, faSliders, faUsers } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { fetchIngredients as fetchApiIngredients, fetchRecipes as fetchApiRecipes } from '../services'
import { Balance, Group, Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError, formatExpenses } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'
import { RecipeComponent } from '../components/RecipeComponent'

export default () => {
  const navigate = useNavigate()

  const params = useParams()
  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

  const [id, setId] = createSignal(Number(params.id))
  const [recipe, setRecipe] = createSignal<Recipe | undefined>()

  createEffect(() => {
    setRecipe(state().recipes ? state().recipes![id()]! : undefined)
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

  onMount(() => {
    fetchIngredients({ refetching: false })
    fetchRecipes({ refetching: false })
  })

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
    // refreshContent()
  }

  return (
    <div class={styles.main}>
      {recipe() ? (
        <Show when={recipe()} keyed>
          {recipe => (
            <RecipeComponent
              recipe={recipe}
              onEdit={() => {}}
              onRelatedRecipeClicked={id => {
                setId(id)
                navigate(import.meta.env.BASE_URL + `recipes/${id}`)
              }}
            />
          )}
        </Show>
      ) : (
        'Loading'
      )}
    </div>
  )
}
