import { Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import { deleteIngredient, postIngredient, putIngredient } from '../services'
import { Ingredient } from '../types'
import { useAppContext } from '../context'
import { formatError, useNavigateUtils } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'
import EditIngredientComponent from '../components/EditIngredientComponent'

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

  const [id, setId] = createSignal(Number(params.id))
  const [ingredient, setIngredient] = createSignal<Ingredient | undefined>()

  const [showIngredientModal, setShowIngredientModal] = createSignal(false)

  createEffect(() => {
    setIngredient(state().ingredients ? state().ingredients![id()]! : undefined)
  })

  const onDeleteIngredient = (ingredient: Ingredient) => {
    deleteIngredient(ingredient)
    navigate(import.meta.env.BASE_URL + `ingredients`)
  }

  const onEditIngredientClicked = (ingredient: Ingredient) => {
    setIngredient(ingredient)
    setShowIngredientModal(true)
  }

  const updateIngredient = (updated: Ingredient) => {
    const promise = updated.id ? putIngredient(updated) : postIngredient(updated)

    promise
      .then(() => {
        refreshAll()
      })
      .catch((e: any) => {
        setError(formatError('Error while updating group', e))
      })

    setShowIngredientModal(false)
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
      {ingredient() ? (
        <Show when={ingredient()} keyed>
          {ingredient => (
            <IngredientComponent
              ingredient={ingredient}
              onNameClick={() => {
                navigate(import.meta.env.BASE_URL + `ingredients/${ingredient.id}`)
              }}
              onTagClicked={searchTag}
              onEdit={onEditIngredientClicked}
              onDelete={onDeleteIngredient}
              onRelatedIngredientClicked={id => {
                setId(id)
                navigate(import.meta.env.BASE_URL + `ingredients/${id}`)
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
