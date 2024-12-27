import { For, Show, createSignal, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { faBlender, faPlus, faPlusSquare, faSquare } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { deleteRecipe, postRecipe, putRecipe } from '../services'
import { Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError, useNavigateUtils } from '../utils'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Recipes.module.css'

import { RecipeComponent } from '../components/RecipeComponent'
import EditRecipeComponent from '../components/EditRecipeComponent'

export default () => {
  const [state, { setError, fetchIngredients, fetchRecipes }] = useAppContext()

  onMount(() => {
    refreshAll(false)
  })

  const refreshAll = async (refetching: boolean = true) => {
    fetchIngredients({ refetching })
    fetchRecipes({ refetching })
  }

  const [showRecipeModal, setShowRecipeModal] = createSignal(false)
  const [recipe, setCurrentRecipe] = createSignal<Recipe | undefined>()

  const navigate = useNavigate()
  const { searchTag } = useNavigateUtils(navigate)

  const onEditRecipeClicked = (recipe?: Recipe) => {
    setCurrentRecipe(recipe)
    setShowRecipeModal(true)
  }

  const onDeleteRecipe = async (recipe: Recipe) => {
    await deleteRecipe(recipe)
    await refreshAll()
  }

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

  return (
    <div class={appStyles['main-page']}>
      <Show when={showRecipeModal()}>
        <EditRecipeComponent recipe={recipe} onDiscard={() => setShowRecipeModal(false)} onConfirm={updateRecipe} />
      </Show>
      {state().recipes ? (
        <>
          <For each={Object.values(state().recipes!)}>
            {recipe => (
              <RecipeComponent
                recipe={recipe}
                onNameClick={() => {
                  navigate(import.meta.env.BASE_URL + `recipes/${recipe.id}`)
                }}
                onTagClicked={searchTag}
                onEdit={onEditRecipeClicked}
                onDelete={onDeleteRecipe}
              />
            )}
          </For>
          <div class={groupStyles.actions}>
            <button
              title='New recipe'
              class={`${appStyles.button} ${appStyles.link}`}
              onClick={() => onEditRecipeClicked()}>
              <Fa class={`${navStyles['nav-icon-base']} ${navStyles['recipe']}`} icon={faSquare} />
              <Fa
                class={`${navStyles['nav-icon']} ${navStyles['recipe']} ${navStyles['nav-icon-overlap-main']}`}
                icon={faBlender}
              />
              <Fa
                class={`${navStyles['nav-icon']} ${navStyles['recipe']}  ${navStyles['nav-icon-overlap-decoration']}`}
                icon={faPlus}
              />
            </button>
          </div>
        </>
      ) : (
        'Loading'
      )}
    </div>
  )
}
