import { Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import { deleteRecipe, postRecipe, putRecipe } from '../services'
import { Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError, useNavigateUtils } from '../utils'

import { RecipeComponent } from '../components/RecipeComponent'
import EditRecipeComponent from '../components/EditRecipeComponent'

import appStyles from '../App.module.css'

export default () => {
  const [state, { setError, fetchIngredients, fetchRecipes }] = useAppContext()

  onMount(() => {
    refreshAll(false)
  })

  const refreshAll = async (refetching: boolean = true) => {
    fetchIngredients({ refetching })
    fetchRecipes({ refetching })
  }

  const navigate = useNavigate()
  const { searchTag } = useNavigateUtils(navigate)

  const params = useParams()

  const [showRecipeModal, setShowRecipeModal] = createSignal(false)

  const [id] = createSignal(Number(params.id))
  const [recipe, setRecipe] = createSignal<Recipe | undefined>()

  createEffect(() => {
    setRecipe(state().recipes ? state().recipes![id()]! : undefined)
  })

  const updateRecipe = (updated: Recipe) => {
    const promise = updated.id ? putRecipe(updated) : postRecipe(updated)

    promise
      .then(() => {
        refreshAll()
      })
      .catch(e => {
        setError(formatError('Error while updating recipe', e))
      })

    setShowRecipeModal(false)
  }

  const onEditRecipeClicked = (recipe?: Recipe) => {
    setRecipe(recipe)
    setShowRecipeModal(true)
  }

  const onDeleteRecipe = async (recipe: Recipe) => {
    await deleteRecipe(recipe)

    navigate(import.meta.env.BASE_URL + `recipes`)
  }

  return (
    <div class={appStyles['main-page']}>
      <Show when={showRecipeModal()}>
        <EditRecipeComponent recipe={recipe} onDiscard={() => setShowRecipeModal(false)} onConfirm={updateRecipe} />
      </Show>
      {recipe() ? (
        <Show when={recipe()} keyed>
          {recipe => (
            <RecipeComponent
              recipe={recipe}
              onTagClicked={searchTag}
              onNameClick={() => {
                navigate(import.meta.env.BASE_URL + `recipes/${recipe.id}`)
              }}
              onEdit={onEditRecipeClicked}
              onDelete={onDeleteRecipe}
            />
          )}
        </Show>
      ) : (
        'Loading'
      )}
    </div>
  )
}
