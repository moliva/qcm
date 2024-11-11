import { For, Show, createEffect, createSignal, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import {
  fetchIngredients as fetchApiIngredients,
  fetchRecipes as fetchApiRecipes,
  postIngredient,
  putIngredient
} from '../services'
import { Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError } from '../utils'

import { IngredientComponent } from '../components/IngredientComponent'
import EditIngredientComponent from '../components/EditIngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'

export default () => {
  const [state, { setError, setIngredients, setRecipes }] = useAppContext()

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

  const [showIngredientModal, setShowIngredientModal] = createSignal(false)
  const [ingredient, setCurrentIngredient] = createSignal<Ingredient | undefined>()

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
  const navigate = useNavigate()

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

  const onNewIngredientClicked = () => {
    setCurrentIngredient(undefined)
    setShowIngredientModal(true)
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
      {state().ingredients ? (
        <>
          <For each={Object.values(state().ingredients!)}>
            {ingredient => (
              <IngredientComponent
                ingredient={ingredient}
                onEdit={() => {}}
                onRelatedIngredientClicked={id => navigate(import.meta.env.BASE_URL + `ingredients/${id}`)}
              />
            )}
          </For>
          <div class={groupStyles.actions}>
            <button
              title='New ingredient'
              class={`${appStyles.button} ${appStyles.link} ${homeStyles['new-group']}`}
              onClick={onNewIngredientClicked}>
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
