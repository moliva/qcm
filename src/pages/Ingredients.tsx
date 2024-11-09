import { For, Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js'
import { useParams } from '@solidjs/router'

import { faPlusSquare, faRotateRight, faSliders, faUsers } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import {
  fetchBalances,
  fetchExpenses,
  fetchGroup,
  fetchIngredients as fetchApiIngredients,
  postGroup,
  putGroup
} from '../services'
import { Balance, Group, Ingredient } from '../types'
import { useAppContext } from '../context'
import { formatError, formatExpenses } from '../utils'

import { Balances } from '../components/Balances'
import { Expenses } from '../components/Expenses'
import { EditGroup } from '../components/EditGroupComponent'
import { UsersModal } from '../components/UsersModal'
import { IngredientComponent } from '../components/IngredientComponent'

import appStyles from '../App.module.css'
import navStyles from '../components/NavComponent.module.css'
import homeStyles from './Home.module.css'
import styles from './Ingredients.module.css'
import groupStyles from './Group.module.css'

export default () => {
  const params = useParams()
  const [state, { setError, setIngredients }] = useAppContext()

  const fetchIngredients = async (opts: { refetching: boolean }): Promise<Record<number, Ingredient>> => {
    try {
      const ingredients = state().ingredients

      // check if we currently have the ingredients or force fetch
      if (!opts.refetching) {
        return ingredients
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
      return ingredients
    }
  }

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [showUsersModal, setShowUsersModal] = createSignal(false)

  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)

  onMount(() => {
    fetchIngredients({ refetching: false })
  })

  const refreshContent = async () => {
    try {
      const currentIdentity = state().identity!
      fetchIngredients({ refetching: true })
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

  const updateGroup = (updated: Group) => {
    const promise = updated.id ? putGroup(updated, state()!.identity!) : postGroup(updated, state()!.identity!)

    promise
      .then(() => {
        // setGroup({ ...group()!, ...updated })
      })
      .catch(e => {
        setError(formatError('Error while updating group', e))
      })

    setShowGroupModal(false)
  }

  const onNewGroupClicked = () => {
    // setCurrentGroup(note as DetailedGroup)
    setShowGroupModal(true)
  }

  return (
    <div class={styles.main}>
      {/**
      <Show when={showGroupModal()}>
        <EditGroup group={group} onDiscard={() => setShowGroupModal(false)} onConfirm={updateGroup} />
      </Show>
      <Show when={showUsersModal()}>
        <UsersModal group={group} onClose={() => setShowUsersModal(false)} />
      </Show>
      */}
      {state().ingredients ? (
        <>
          {/**
          <div class={styles['home-content']}>
            <div class={styles['home-controls']}>
              <Filter value={filter} onChange={setFilter} />
            </div>
            <div class={styles.groups}>
              <For each={filteredGroups()}>{group => <GroupComponent group={group} onEdit={showModal} />}</For>
            </div>
          </div>
      */}
          <For each={Object.values(state().ingredients!)}>
            {ingredient => <IngredientComponent ingredient={ingredient} onEdit={() => {}} />}
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
              title='New ingredient'
              class={`${appStyles.button} ${appStyles.link} ${homeStyles['new-group']}`}
              onClick={onNewGroupClicked}>
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
