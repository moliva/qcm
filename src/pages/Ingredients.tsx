import { For, Show, createSignal, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { faCarrot, faPlus, faSquare } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { deleteIngredient, postIngredient, putIngredient } from '../services'
import { Ingredient } from '../types'
import { useAppContext } from '../context'
import { formatError, useNavigateUtils } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'
import EditIngredientComponent from '../components/EditIngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import styles from './Ingredients.module.css'

export default () => {
  const [state, { setError, fetchIngredients, fetchRecipes }] = useAppContext()

  onMount(() => {
    refreshAll(false)
  })

  const refreshAll = async (refetching: boolean = true) => {
    fetchIngredients({ refetching })
    fetchRecipes({ refetching })
  }

  const [showIngredientModal, setShowIngredientModal] = createSignal(false)
  const [ingredient, setCurrentIngredient] = createSignal<Ingredient | undefined>()

  const navigate = useNavigate()
  const { searchTag } = useNavigateUtils(navigate)

  const updateIngredient = (updated: Ingredient) => {
    const promise = updated.id
      ? putIngredient(updated, state()!.identity!)
      : postIngredient(updated, state()!.identity!)

    promise
      .then(() => {
        refreshAll()
      })
      .catch((e: any) => {
        setError(formatError('Error while updating group', e))
      })

    setShowIngredientModal(false)
  }

  const onDeleteIngredient = async (ingredient: Ingredient) => {
    await deleteIngredient(ingredient, state()!.identity!)
    await refreshAll()
  }

  const onEditIngredientClicked = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient)
    setShowIngredientModal(true)
  }

  const onNewIngredientClicked = () => {
    setCurrentIngredient(undefined)
    setShowIngredientModal(true)
  }

  return (
    <div class={appStyles['main-page']}>
      <Show when={showIngredientModal()}>
        <EditIngredientComponent
          ingredient={ingredient}
          onDiscard={() => setShowIngredientModal(false)}
          onConfirm={updateIngredient}
        />
      </Show>
      {state().ingredients ? (
        <>
          <For each={Object.values(state().ingredients!)}>
            {ingredient => (
              <IngredientComponent
                ingredient={ingredient}
                onNameClick={() => {
                  navigate(import.meta.env.BASE_URL + `ingredients/${ingredient.id}`)
                }}
                onTagClicked={searchTag}
                onEdit={onEditIngredientClicked}
                onDelete={onDeleteIngredient}
                onRelatedIngredientClicked={id => navigate(import.meta.env.BASE_URL + `ingredients/${id}`)}
              />
            )}
          </For>
          <div class={styles.actions}>
            <button
              title='New ingredient'
              class={`${appStyles.button} ${appStyles.link}`}
              onClick={onNewIngredientClicked}>
              <Fa class={`${navStyles['nav-icon-base']} ${navStyles['ingredient']}`} icon={faSquare} />
              <Fa class={`${navStyles['nav-icon']} ${navStyles['nav-icon-overlap-main']}`} icon={faCarrot} />
              <Fa class={`${navStyles['nav-icon']} ${navStyles['nav-icon-overlap-decoration']}`} icon={faPlus} />
            </button>
          </div>
        </>
      ) : (
        'Loading'
      )}
    </div>
  )
}
