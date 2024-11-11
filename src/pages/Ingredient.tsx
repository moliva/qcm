import { Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import {
  deleteIngredient,
  fetchIngredients as fetchApiIngredients,
  fetchRecipes as fetchApiRecipes,
  postIngredient,
  putIngredient
} from '../services'
import { Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'
import EditIngredientComponent from '../components/EditIngredientComponent'

export default () => {
  const navigate = useNavigate()

  const params = useParams()
  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

  const [id, setId] = createSignal(Number(params.id))
  const [ingredient, setIngredient] = createSignal<Ingredient | undefined>()

  const [showIngredientModal, setShowIngredientModal] = createSignal(false)

  createEffect(() => {
    setIngredient(state().ingredients ? state().ingredients![id()]! : undefined)
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

  // createEffect(() => {
  //   try {
  //     // TODO - refactor this ensuring we have fetched detailed group, expenses and balances - moliva - 2024/04/11
  //     if (group() && state().groups[group()!.id!].members && state().groups[group()!.id!].expenses) {
  //       const expenses = formatExpenses(state(), group()!)
  //
  //       setExpenses(expenses)
  //       setBalances(state().groups[group()!.id!].balances)
  //     }
  //   } catch (e: any) {
  //     setError(formatError('Error while formatting and setting new data', e))
  //   }
  // })

  const onDeleteIngredient = (ingredient: Ingredient) => {
    deleteIngredient(ingredient, state()!.identity!)
  }

  const onEditIngredientClicked = (ingredient: Ingredient) => {
    setIngredient(ingredient)
    setShowIngredientModal(true)
  }

  const updateIngredient = (updated: Ingredient) => {
    const promise = updated.id
      ? putIngredient(updated, state()!.identity!)
      : postIngredient(updated, state()!.identity!)

    promise
      .then(() => {
        // setGroup({ ...group()!, ...updated })
      })
      .catch((e: any) => {
        setError(formatError('Error while updating group', e))
      })

    setShowIngredientModal(false)
  }

  return (
    <div class={styles.main}>
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
