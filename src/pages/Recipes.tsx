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
import { Balance, Group, Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'
import { formatError, formatExpenses } from '../utils'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'

import { RecipeComponent } from '../components/RecipeComponent'
import EditRecipeComponent from '../components/EditRecipeComponent'

export default () => {
  const params = useParams()
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

  const onEditRecipeClicked = (recipe?: Recipe) => {
    setCurrentRecipe(recipe)
    setShowRecipeModal(true)
  }

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

  const onDeleteRecipe = (recipe: Recipe) => {
    deleteRecipe(recipe, state()!.identity!)
  }

  const updateRecipe = (updated: Recipe) => {
    const promise = updated.id ? putRecipe(updated, state()!.identity!) : postRecipe(updated, state()!.identity!)

    promise
      .then(() => {
        // setRecipe({ ...recipe()!, ...updated })
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
          {/**
          <div style={{ display: 'inline-flex', 'margin-bottom': '10px', gap: '8px' }}>
            <label style={{ 'font-weight': '700', 'font-size': 'x-large' }} class={styles.name}>
              group name
            </label>
            <button title='Group settings' onClick={() => setShowGroupModal(true)}>
              <Fa class={`${styles['group-icon']} ${styles['group-settings-icon']}`} icon={faSliders} />
            </button>
            <button title='Users' onClick={() => setShowUsersModal(true)}>
              <Fa class={`${styles['group-icon']} ${styles['group-users-icon']}`} icon={faUsers} />
            </button>
            <button title='Refresh group' onClick={() => refreshAll()}>
              <Fa class={`${styles['group-icon']} ${styles['group-refresh-icon']}`} icon={faRotateRight} />
            </button>
          </div>
          <ul class={styles['tab-group']}>
            <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 0 }} onClick={updateTab(0)}>
              Expenses
            </li>
            <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 1 }} onClick={updateTab(1)}>
              Balances
            </li>
          </ul>
          <hr class={styles['divider']} />
      */}
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
