import { Accessor, createSignal, For } from 'solid-js'

import { Ingredient } from '../types'
import { useAppContext } from '../context'

import MultiSelect, { Ref } from '@moliva/solid-multiselect'

import appStyles from '../App.module.css'
import styles from './EditIngredientComponent.module.css'

export type EditIngredientProps = {
  ingredient: Accessor<Ingredient | undefined>

  onConfirm(ingredient: Ingredient): void
  onDiscard(): void
}

export default (props: EditIngredientProps) => {
  const { ingredient } = props

  const [state] = useAppContext()

  const stateOptions = ['unknown', 'good', 'warning', 'bad']

  let newIngredientName
  let newIngredientNotes
  let ingredientState
  let tagsRef

  const [relatedRef, setRelatedRef] = createSignal<Ref<Ingredient> | undefined>()

  const newIngredient = () =>
    ({
      id: ingredient()?.id,
      name: newIngredientName!.value,
      state: ingredientState!.value,
      tags: parseTags(tagsRef!.value),
      notes: newIngredientNotes!.value,

      related: relatedRef()!
        .values()
        .map(e => e.id)
    }) as Ingredient

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
            class={styles['currency-select']}
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
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <textarea style={{ width: '100%' }} ref={newIngredientNotes} placeholder='Notes' rows='10'>
            {ingredient() ? ingredient()?.notes : ''}
          </textarea>
        </div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label>Related ingredients</label>
          <MultiSelect
            ref={setRelatedRef}
            // onSelect={props.onChange}
            // onRemove={props.onChange}
            emptyRecordMsg='No ingredients'
            options={Object.values(state().ingredients!)}
            isObject
            displayValue='id'
            renderValue={(member: Ingredient) => <label>{member.name}</label>}
            selectedValues={ingredient()?.related.map(e => state()!.ingredients![e])}
            selectionLimit={20}
            hidePlaceholder={true}
            // placeholder={props.placeholder}
            // closeOnSelect={props.closeOnSelect}
            // disable={props.disable}
            style={{
              optionContainer: { 'background-color': '#282c34' },
              option: { display: 'flex', 'align-items': 'center', height: '40px', margin: '0', padding: '0 10px' }
            }}
          />
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
