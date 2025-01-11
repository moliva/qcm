import { Accessor, createSignal, For, onCleanup, onMount } from 'solid-js'

import { Ingredient, Kind, SearchOptions, State } from '../types'

import appStyles from '../App.module.css'
import styles from './EditSearchOptions.module.css'
import navStyles from './NavComponent.module.css'
import ingStyles from './RecipeComponent.module.css'
import StateComponent from './StateComponent'
import KindComponent from './KindComponent'
import MultiSelectIngredients from './MultiSelectIngredients'
import { Ref } from '@moliva/solid-multiselect'
import { useAppContext } from '../context'

export type EditSearchOptionsProps = {
  searchOptions: Accessor<SearchOptions>

  onConfirm(searchOptions: SearchOptions): void
  onDiscard(): void
}

export default (props: EditSearchOptionsProps) => {
  const { searchOptions } = props

  const [state] = useAppContext()

  const stateOptions = ['unknown', 'good', 'warning', 'bad'] as State[]
  const kindOptions = ['recipe', 'ingredient'] as Kind[]

  let searchTerm
  let statesChecked
  let kindsChecked

  let onlyCurrentIngredientsRef

  const [ingredientsRef, setIngredientsRef] = createSignal<Ref<Ingredient> | undefined>()

  const stateChecked = Object.fromEntries(stateOptions.map(e => [e, undefined]))
  const kindChecked = Object.fromEntries(kindOptions.map(e => [e, undefined]))

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      props.onDiscard()
      return false
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  function onConfirm() {
    const keywords = searchTerm!.value.split(' ')
    const states = Object.entries(stateChecked)
      .filter(([, ref]) => ref.checked)
      .map(([e]) => e) as State[]
    const kinds = Object.entries(kindChecked)
      .filter(([, ref]) => ref.checked)
      .map(([e]) => e) as Kind[]

    const onlyCurrentIngredients = onlyCurrentIngredientsRef!.checked
    const ingredients = ingredientsRef()!
      .values()
      .map(e => e.id!)

    props.onConfirm({ keywords, states, kinds, onlyCurrentIngredients, ingredients })
  }

  function onKindsClicked() {
    Object.entries(kindChecked).forEach(([, v]) => {
      ;(v as any)!.checked = kindsChecked!.checked
    })
  }

  function onStatesClicked() {
    Object.entries(stateChecked).forEach(([, v]) => {
      ;(v as any)!.checked = statesChecked!.checked
    })
  }

  return (
    <div class={styles.modal}>
      <div
        class={styles['modal-content']}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            onConfirm()
          }
        }}>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label class={styles['modal-title']}>Search</label>
          <label class={ingStyles['ingredient-subtitle']}>Keywords</label>
          <input
            class={navStyles['search-input']}
            style={{
              width: 'auto',
              'max-width': '100%'
            }}
            ref={searchTerm}
            value={searchOptions().keywords.join(' ')}
          />
        </div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <div style={{ display: 'inline-flex', 'align-items': 'end' }}>
            <input
              type='checkbox'
              ref={statesChecked}
              class={styles['modal-name']}
              onClick={onStatesClicked}
              checked={searchOptions().states.length === Object.keys(stateChecked).length}
            />
            <label class={ingStyles['ingredient-subtitle']} style={{ 'font-weight': '600' }}>
              States
            </label>
          </div>
          <For each={stateOptions}>
            {state => (
              <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '2px' }}>
                <input
                  type='checkbox'
                  ref={stateChecked[state]}
                  class={styles['modal-name']}
                  checked={!!searchOptions().states.find(e => e === state)}
                />
                <label>{state}</label>
                <StateComponent state={state} iconClass='' />
              </div>
            )}
          </For>
        </div>
        <div style={{ 'margin-top': '10px', display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <div style={{ display: 'inline-flex', 'align-items': 'end' }}>
            <input
              type='checkbox'
              ref={kindsChecked}
              class={styles['modal-name']}
              onClick={onKindsClicked}
              checked={searchOptions().kinds.length === Object.keys(kindChecked).length}
            />
            <label class={ingStyles['ingredient-subtitle']} style={{ 'font-weight': '600' }}>
              Kinds
            </label>
          </div>
          <For each={kindOptions}>
            {kind => (
              <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '2px' }}>
                <input
                  type='checkbox'
                  ref={kindChecked[kind]}
                  class={styles['modal-name']}
                  checked={!!searchOptions().kinds.find(e => e === kind)}
                />
                <label>{kind} </label>
                <KindComponent kind={kind} iconClass={''} />
              </div>
            )}
          </For>
        </div>
        <div style={{ 'margin-top': '10px', display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label class={ingStyles['ingredient-subtitle']} style={{ 'font-weight': '600' }}>
            Recipes
          </label>
          <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '2px' }}>
            <input
              type='checkbox'
              ref={onlyCurrentIngredientsRef}
              class={styles['modal-name']}
              onClick={() => {}}
              checked={searchOptions().onlyCurrentIngredients}
            />
            <label>Only show recipes including all the listed ingredients</label>
          </div>
          <MultiSelectIngredients
            ref={setIngredientsRef}
            selectedValues={searchOptions().ingredients.map(e => state()!.ingredients![e])}
          />
        </div>
        <div class={styles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>
            Search
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
