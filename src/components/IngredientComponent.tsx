import { A, useNavigate } from '@solidjs/router'

import { Ingredient } from '../types'

import { useAppContext } from '../context'

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

  onRelatedIngredientClicked(id: number): void

  onEdit(ingredient: Ingredient): void
}

export const IngredientComponent = (props: IngredientComponentProps) => {
  const { ingredient } = props
  const [state, { setError, setIngredients }] = useAppContext()

  const navigate = useNavigate()

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
      <textarea class={styles['ingredient-notes']} readonly={true}>
        {ingredient.notes}
      </textarea>
      {ingredient.related.length > 0 ? (
        <>
          <label class={styles['ingredient-subtitle']}>Related</label>
          <div class={styles['ingredient-related-set']}>
            <For each={ingredient.related.map(id => state().ingredients![id])}>
              {related => (
                <label
                  class={`${styles['ingredient-related']} ${appStyles.button}`}
                  onClick={() => props.onRelatedIngredientClicked(related.id)}>
                  {related.name}
                </label>
              )}
            </For>
          </div>
        </>
      ) : null}
      {state().recipes && ingredient.recipes.length > 0 ? (
        <>
          <label class={styles['ingredient-subtitle']}>Recipes</label>
          <div class={styles['ingredient-related-set']}>
            <For each={ingredient.recipes.map(id => state().recipes![id])}>
              {recipe => (
                <label
                  class={`${styles['ingredient-related']} ${appStyles.button}`}
                  onClick={() => navigate(import.meta.env.BASE_URL + `recipes/${recipe.id}`)}>
                  {recipe.name}
                </label>
              )}
            </For>
          </div>
        </>
      ) : null}
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
      return [faCircleQuestion, 'lightgrey']
  }
}
