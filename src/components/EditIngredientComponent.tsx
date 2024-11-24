import { Accessor, createSignal, For, onCleanup, onMount } from 'solid-js'

import { Ingredient } from '../types'
import { useAppContext } from '../context'

import MultiSelect, { Ref } from '@moliva/solid-multiselect'
import KindComponent from './KindComponent'

import appStyles from '../App.module.css'
import styles from './EditSearchOptions.module.css'
import searchStyles from './EditSearchOptions.module.css'
import ingStyles from './RecipeComponent.module.css'

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

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      props.onDiscard()
      return false
      // } else if (e.key === 'Enter' && newIngredientNotes !== document.activeElement) {
      //   props.onConfirm(newIngredient())
      //   return false
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

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
    <div class={searchStyles.modal}>
      <div class={searchStyles['modal-content']}>

        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <KindComponent kind='ingredient' iconClass={searchStyles['big-icon']} />
          <input
            ref={newIngredientName}
            style={{ width: '100%' }}
            class={styles['modal-name']}
            placeholder='Ingredient name'
            value={ingredient()?.name ?? ''}
          />
        </div>
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <label style={{ 'margin-top': 0 }} class={ingStyles['ingredient-subtitle']}>
            State
          </label>
          <select class={styles['currency-select']} ref={ingredientState} value={ingredient()?.state ?? 'unknown'}>
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
          <label class={ingStyles['ingredient-subtitle']}>Notes</label>
          <textarea
            style={{ width: 'auto' }}
            class={searchStyles['steps']}
            ref={newIngredientNotes}
            placeholder='Notes'
            rows='10'>
            {ingredient() ? ingredient()?.notes : ''}
          </textarea>
        </div>
        <div style={{ display: 'inline-flex', 'align-items': 'start', 'flex-direction': 'column', gap: '10px' }}>
          <label class={ingStyles['ingredient-subtitle']}>Related Ingredients</label>
          <MultiSelect
            ref={setRelatedRef}
            // onSelect={props.onChange}
            // onRemove={props.onChange}
            emptyRecordMsg='No ingredients'
            options={Object.values(state().ingredients ?? [])}
            isObject
            avoidHighlightFirstOption={true}
            displayValue='id'
            renderValue={(member: Ingredient) => <label>{member.name}</label>}
            selectedValues={ingredient()?.related.map(e => state()!.ingredients![e])}
            selectionLimit={20}
            hidePlaceholder={true}
            // placeholder={props.placeholder}
            // closeOnSelect={props.closeOnSelect}
            // disable={props.disable}
            style={{
              multiSelectContainer: { cursor: 'pointer' },
              searchBox: { cursor: 'pointer', 'border-radius': 0 },
              optionContainer: { 'background-color': 'var(--background)' },
              chips: {
                'background-color': 'var(--background)',
                border: '1px solid var(--decoration)',
                'border-radius': 0,
                color: 'var(--text)'
              }
            }}
          />
        </div>
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
