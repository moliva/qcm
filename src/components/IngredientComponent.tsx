import { A } from '@solidjs/router'

import { Group, Ingredient } from '../types'

import styles from './IngredientComponent.module.css'
import appStyles from '../App.module.css'
import navStyles from './NavComponent.module.css'
import {
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faTriangleExclamation,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'
import { For } from 'solid-js'

export type IngredientComponentProps = {
  ingredient: Ingredient

  onEdit(ingredient: Ingredient): void
}

export const IngredientComponent = (props: IngredientComponentProps) => {
  const { ingredient } = props

  const [icon, color] = renderState(ingredient)

  return (
    <div class={styles.ingredient}>
      <div class={styles['ingredient-name']}>
        <label>{ingredient.name}</label>
        <span style={{ color: color }}>
          <Fa class={styles['ingredient-state-icon']} icon={icon} />
        </span>
      </div>
      <div class={styles['note-tags']}>
        <For each={ingredient.tags}>
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
    </div>
  )
}

function renderState(ingredient: Ingredient): [IconDefinition, string] {
  switch (ingredient.state) {
    case 'good':
      return [faCircleCheck, 'green']
    case 'bad':
      return [faCircleXmark, 'red']
    case 'warning':
      return [faTriangleExclamation, 'yellow']
    default:
      return [faCircleQuestion, 'grey']
  }
}
