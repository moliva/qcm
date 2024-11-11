import { Accessor, For } from 'solid-js'

import { DetailedGroup, Group, Ingredient } from '../types'
import { useAppContext } from '../context'

import appStyles from '../App.module.css'
import styles from './EditIngredientComponent.module.css'
import expenseStyles from './ExpenseModal.module.css'

export type EditIngredientProps = {
  ingredient: Accessor<Ingredient | undefined>

  onConfirm(ingredient: Ingredient): void
  onDiscard(): void
}

export default (props: EditIngredientProps) => {
  const { ingredient } = props

  const [state] = useAppContext()

  let newGroupName
  let simplifiedBalance
  let defaultCurrencyId

  const newGroup = () =>
    ({
      id: ingredient()?.id,
      name: newGroupName!.value,
      state: 'good',
      tags: [],
      notes: '',

      related: [],
      recipes: []
    }) as any as Ingredient

  // export type Ingredient = {
  //   id: number | undefined
  //   name: string
  //   created_at?: string | undefined
  //
  //   state: State
  //   tags: string[]
  //   notes: string
  //
  //   related: number[]
  //   recipes: number[]
  // }

  return (
    <div class={styles.modal}>
      <div class={styles['modal-content']}>
        <input
          ref={newGroupName}
          class={styles['modal-name']}
          placeholder='Group name'
          value={ingredient()?.name ?? ''}
        />
        {/**
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <label>Default currency</label>
          <select
            class={expenseStyles['currency-select']}
            ref={defaultCurrencyId}
            value={group()?.default_currency_id ?? state().currencies[1].id}>
            <For each={Object.values(state().currencies)}>
              {currency => (
                <option value={currency.id} title={currency.description}>
                  {currency.acronym}
                </option>
              )}
            </For>
          </select>
        </div>
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <label>Simplified balance</label>
          <input
            type='checkbox'
            ref={simplifiedBalance}
            class={styles['modal-name']}
            checked={group()?.balance_config?.simplified ?? false}
          />
        </div>
        */}
        <hr class={styles.divider} />
        <div class={styles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={() => props.onConfirm(newGroup())}>
            {ingredient() ? 'Edit' : 'Create'}
          </button>
          <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onDiscard}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
