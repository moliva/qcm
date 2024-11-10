import { A } from '@solidjs/router'

import { Group, Ingredient, Recipe } from '../types'

import { useAppContext } from '../context'
import {
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faTriangleExclamation,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'
import { For } from 'solid-js'

import styles from './RecipeComponent.module.css'
import appStyles from '../App.module.css'
import navStyles from './NavComponent.module.css'

export type RecipeComponentProps = {
  recipe: Recipe

  onEdit(recipe: Recipe): void
}

export const RecipeComponent = (props: RecipeComponentProps) => {
  const { recipe } = props
  const [state, { setError, setIngredients }] = useAppContext()

  const [icon, color] = renderState(recipe)

  return (
    <div class={styles.ingredient}>
      <div class={styles['ingredient-name']}>
        <label>{recipe.name}</label>
        <span style={{ color: color }}>
          <Fa class={styles['ingredient-state-icon']} icon={icon} />
        </span>
      </div>
      <div class={styles['note-tags']}>
        <For each={recipe.tags}>
          {tag => (
            <label
              class={`${styles['note-tag']} ${appStyles.button}`}
              // classList={{ [styles.active]: activeTag?.() === tag }}
              // onClick={() => onTagClicked(tag)}
            >
              {tag}
            </label>
          )}
        </For>
      </div>
      <label class={styles['ingredient-subtitle']}>Ingredients</label>
      <div class={styles['ingredient-related-set']}>
        <For each={recipe.ingredients.map(([id, measure]) => [state().ingredients![id], measure] as const)}>
          {([related, measure]) => (
            <div style={{ display: 'flex', 'align-items': 'center', gap: '5px' }}>
              <label
                class={`${styles['ingredient-related']} ${appStyles.button}`}
                onClick={() => console.log('ingredient', related)}>
                {related.name}
              </label>
              <span>{measure}</span>
            </div>
          )}
        </For>
      </div>
      <label class={styles['ingredient-subtitle']}>Instructions</label>
      <textarea class={styles['ingredient-notes']} readonly={true}>
        {recipe.notes}
      </textarea>
    </div>
  )
}

function renderState(recipe: Recipe): [IconDefinition, string] {
  switch (recipe.state) {
    case 'good':
      return [faCircleCheck, 'green']
    case 'bad':
      return [faCircleXmark, 'red']
    case 'warning':
      return [faTriangleExclamation, 'yellow']
    default:
      return [faCircleQuestion, 'lightgrey']
  }
}
