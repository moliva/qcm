import { Accessor, createSignal, For, onCleanup, onMount } from 'solid-js'

import { faPlusSquare, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { Recipe } from '../types'
import { useAppContext } from '../context'

import KindComponent from './KindComponent'

import appStyles from '../App.module.css'
import searchStyles from './EditSearchOptions.module.css'
import ingStyles from './RecipeComponent.module.css'

export type EditIngredientProps = {
  recipe: Accessor<Recipe | undefined>

  onConfirm(recipe: Recipe): void
  onDiscard(): void
}

type IngredientWorkingType = { key: number; id: number; measure: string }

export default (props: EditIngredientProps) => {
  const { recipe: ingredient } = props

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  const [state] = useAppContext()

  const [ingredients, setIngredients] = createSignal<IngredientWorkingType[]>([])

  const stateOptions = ['unknown', 'good', 'warning', 'bad']

  let newIngredientName
  let newIngredientNotes
  let ingredientState
  let tagsRef
  let ingredientsRef

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
    let key = 0
    const _ingredients = (ingredient()?.ingredients ?? []).map(e => ({
      key: key++,
      id: e.ingredient,
      measure: e.measure
    }))
    setIngredients(_ingredients)
  })

  const newIngredient = () =>
    ({
      id: ingredient()?.id,
      name: newIngredientName!.value,
      state: ingredientState!.value,
      tags: parseTags(tagsRef!.value),
      notes: newIngredientNotes!.value,

      ingredients: readIngredients()
    }) as Recipe

  function readIngredients() {
    const _ingredients = []

    for (const row of ingredientsRef!.children) {
      const ingredient = Number(row.children[0].value)
      const measure = row.children[1].value

      _ingredients.push({ ingredient, measure })
    }

    return _ingredients
  }

  function removeIngredient(key: number) {
    const _ingredients = [...ingredients()]

    const index = _ingredients.findIndex(e => e.key === key)
    _ingredients.splice(index, 1)

    setIngredients(_ingredients)
  }

  function addIngredient() {
    const _ingredients = [...ingredients()]

    const key = _ingredients.length > 0 ? _ingredients[_ingredients.length - 1].key + 1 : 0
    _ingredients.push({ key, id: Object.values(state().ingredients!)[0].id!, measure: '' })

    setIngredients(_ingredients)
  }

  return (
    <div class={searchStyles.modal}>
      <div class={searchStyles['modal-content']}>
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <KindComponent kind='recipe' iconClass={searchStyles['big-icon']} />
          <input
            ref={newIngredientName}
            class={searchStyles['modal-name']}
            style={{ width: '100%' }}
            placeholder='Recipe name'
            value={ingredient()?.name ?? ''}
          />
        </div>
        <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '10px' }}>
          <label style={{ 'margin-top': 0 }} class={ingStyles['ingredient-subtitle']}>
            State
          </label>
          <select
            class={searchStyles['currency-select']}
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
        <div style={{ display: 'inline-flex', 'flex-direction': 'column', 'align-items': 'start', gap: '10px' }}>
          <label class={ingStyles['ingredient-subtitle']}>Tags</label>
          <input
            ref={tagsRef}
            style={{ width: '100%' }}
            class={searchStyles['modal-tags']}
            placeholder='Comma separated tags'
            value={ingredient()?.tags?.join(',') ?? ''}></input>
        </div>
        <div style={{ display: 'flex', width: '100%', 'flex-direction': 'column', gap: '10px' }}>
          <label class={ingStyles['ingredient-subtitle']}>Ingredients</label>
          <div ref={ingredientsRef}>
            <For each={ingredients()}>
              {ingredient => (
                <div style={{ display: 'flex', 'align-items': 'center' }}>
                  <select value={ingredient.id}>
                    <For each={Object.values(state().ingredients!)}>
                      {ingredient => (
                        <option value={ingredient.id} title={ingredient.name}>
                          {ingredient.name}
                        </option>
                      )}
                    </For>
                  </select>
                  <input
                    style={{ width: '100%' }}
                    placeholder='N units/tablespoons/grams...'
                    value={ingredient.measure}
                  />

                  <button
                    title='Remove ingredient'
                    style={{ 'margin-left': 'auto' }}
                    class={`${appStyles.button} ${appStyles.link} ${ingStyles['delete-control']}`}
                    onClick={() => {
                      removeIngredient(ingredient.key)
                    }}>
                    <Fa class={ingStyles['delete-icon']} icon={faXmark} />
                  </button>
                </div>
              )}
            </For>
          </div>
          <button
            title='Add ingredient'
            style={{ 'margin-left': 'auto' }}
            class={`${appStyles.button} ${appStyles.link} ${searchStyles['add-ingredient']}`}
            onClick={() => {
              addIngredient()
            }}>
            <Fa class={ingStyles['add-icon']} icon={faPlusSquare} />
          </button>
        </div>
        <div style={{ display: 'flex', width: '100%', 'flex-direction': 'column', gap: '10px' }}>
          <label class={ingStyles['ingredient-subtitle']}>Steps</label>
          <textarea class={searchStyles['steps']} ref={newIngredientNotes} placeholder='Steps...' rows='10'>
            {ingredient() ? ingredient()?.notes : ''}
          </textarea>
        </div>
        <div class={searchStyles['modal-controls']}>
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
