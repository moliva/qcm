import { For, Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import {
  deleteRecipe,
  fetchIngredients as fetchApiIngredients,
  fetchRecipes as fetchApiRecipes,
  postRecipe,
  putRecipe
} from '../services'
import { Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError } from '../utils'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'

import { RecipeComponent } from '../components/RecipeComponent'
import EditRecipeComponent from '../components/EditRecipeComponent'

export default () => {
  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

  const [showRecipeModal, setShowRecipeModal] = createSignal(false)
  const [recipe, setCurrentRecipe] = createSignal<Recipe | undefined>()

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

  const navigate = useNavigate()

  onMount(() => {
    fetchIngredients({ refetching: false })
    fetchRecipes({ refetching: false })
  })

  const refreshContent = async () => {
    try {
      const _currentIdentity = state().identity!
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

  const onEditRecipeClicked = (recipe?: Recipe) => {
    setCurrentRecipe(recipe)
    setShowRecipeModal(true)
  }

  const refreshAll = async () => {
    fetchIngredients({ refetching: true })
    fetchRecipes({ refetching: true })
  }

  const onDeleteRecipe = async (recipe: Recipe) => {
    await deleteRecipe(recipe, state()!.identity!)
    await refreshAll()
  }

  const updateRecipe = (updated: Recipe) => {
    const promise = updated.id ? putRecipe(updated, state()!.identity!) : postRecipe(updated, state()!.identity!)

    promise
      .then(() => {
        refreshAll()
      })
      .catch(e => {
        setError(formatError('Error while updating recipe', e))
      })

    setShowRecipeModal(false)
  }

  const onNewRecipeClicked = () => {
    setCurrentRecipe(undefined)
    setShowRecipeModal(true)
  }

  return (
    <div class={styles.main}>
      <Show when={showRecipeModal()}>
        <EditRecipeComponent recipe={recipe} onDiscard={() => setShowRecipeModal(false)} onConfirm={updateRecipe} />
      </Show>
      {state().recipes ? (
        <>
          <For each={Object.values(state().recipes!)}>
            {recipe => (
              <RecipeComponent
                recipe={recipe}
                onEdit={onEditRecipeClicked}
                onDelete={onDeleteRecipe}
                onRelatedRecipeClicked={id => navigate(import.meta.env.BASE_URL + `recipes/${id}`)}
              />
            )}
          </For>
          <div class={groupStyles.actions}>
            <button
              title='New recipe'
              class={`${appStyles.button} ${appStyles.link} ${homeStyles['new-group']}`}
              onClick={() => onEditRecipeClicked()}>
              <Fa class={navStyles['nav-icon']} icon={faPlusSquare} />
            </button>
          </div>
        </>
      ) : (
        'Loading'
      )}
    </div>
  )
}
