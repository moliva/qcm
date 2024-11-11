import { Accessor, createSignal, For } from 'solid-js'

import { Ingredient, Recipe } from '../types'
import { useAppContext } from '../context'

import appStyles from '../App.module.css'
import homeStyles from '../pages/Home.module.css'
import navStyles from './NavComponent.module.css'
import styles from './EditIngredientComponent.module.css'
import expenseStyles from './ExpenseModal.module.css'
import { faPlusSquare, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

export type EditIngredientProps = {
  recipe: Accessor<Recipe | undefined>

  onConfirm(recipe: Recipe): void
  onDiscard(): void
}

export default (props: EditIngredientProps) => {
  const { recipe: ingredient } = props

  const [state] = useAppContext()

  const stateOptions = ['unknown', 'good', 'warning', 'bad']

  let newIngredientName
  let newIngredientNotes
  let ingredientState
  let tagsRef
  let ingredientsRef

  const newIngredient = () =>
    ({
      id: ingredient()?.id,
      name: newIngredientName!.value,
      state: 'good',
      tags: parseTags(tagsRef!.value),
      notes: newIngredientNotes!.value

      // ingredients: relatedRef()!
      //   .values()
      //   .map(e => e.id),
    }) as Recipe

  function addIngredient() {
    const child = (
      <div style={{ display: 'flex', 'align-items': 'center' }}>
        <select class={expenseStyles['currency-select']} value={''}>
          <For each={Object.values(state().ingredients!)}>
            {ingredient => (
              <option value={ingredient.id} title={ingredient.name}>
                {ingredient.name}
              </option>
            )}
          </For>
        </select>
        <input style={{ width: '100%' }} />
        <button
          title='Remove ingredient'
          style={{ 'margin-left': 'auto' }}
          class={`${appStyles.button} ${appStyles.link} ${homeStyles['new-group']}`}
          onClick={() => {}}>
          <Fa class={navStyles['nav-icon']} icon={faXmarkCircle} />
        </button>
      </div>
    )

    ingredientsRef!.appendChild(child)
  }

  return (
    <div class={styles.modal}>
      <div class={styles['modal-content']}>
        <input
          ref={newIngredientName}
          class={styles['modal-name']}
          placeholder='Ingrdient name'
          value={ingredient()?.name ?? ''}
        />
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <label>State</label>
          <select
            class={expenseStyles['currency-select']}
            ref={ingredientState}
            value={ingredient()?.state ?? 'unknown'}>
            <For each={stateOptions}>
              {state => (
                <option value={state} title={state}>
                  {state}
                </option>
              )}
            </For>
          </select>
        </div>
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <input
            ref={tagsRef}
            style={{ width: '100%' }}
            class={styles['modal-tags']}
            placeholder='Comma separated tags'
            value={ingredient()?.tags?.join(',') ?? ''}></input>
        </div>
        <div style={{ display: 'flex', width: '100%', 'flex-direction': 'column', gap: '10px' }}>
          <label>Ingredients</label>
          <div ref={ingredientsRef}></div>
          <button
            title='Add ingredient'
            style={{ 'margin-left': 'auto' }}
            class={`${appStyles.button} ${appStyles.link} ${homeStyles['new-group']}`}
            onClick={() => {
              addIngredient()
            }}>
            <Fa class={navStyles['nav-icon']} icon={faPlusSquare} />
          </button>
        </div>
        <div style={{ display: 'flex', width: '100%', 'flex-direction': 'column', gap: '10px' }}>
          <label>Instructions</label>
          <textarea style={{ width: '100%' }} ref={newIngredientNotes} placeholder='Steps...' rows='10'>
            {ingredient() ? ingredient()?.notes : ''}
          </textarea>
        </div>
        <hr class={styles.divider} />
        <div class={styles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={() => props.onConfirm(newIngredient())}>
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

export function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .filter(line => line.length)
    .map(line => line.trim().toLowerCase())
}
