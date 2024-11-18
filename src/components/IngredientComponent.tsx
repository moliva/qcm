import { useNavigate } from '@solidjs/router'

import { faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'
import { For } from 'solid-js'

import { Ingredient, IngredientId } from '../types'
import { useAppContext } from '../context'
import { renderState } from '../utils'
import styles from './IngredientComponent.module.css'

import appStyles from '../App.module.css'

export type IngredientComponentProps = {
  ingredient: Ingredient

  onNameClick(recipe: Ingredient): void
  onTagClicked(tag: string): void
  onRelatedIngredientClicked(id: IngredientId): void

  onEdit?(ingredient: Ingredient): void
  onDelete?(ingredient: Ingredient): void
}

export const IngredientComponent = (props: IngredientComponentProps) => {
  const { ingredient } = props
  const [state, { setError, setIngredients }] = useAppContext()

  const navigate = useNavigate()

  const [icon, color] = renderState(ingredient.state)

  return (
    <div class={styles.ingredient}>
      <div class={styles['ingredient-name']}>
        <label style={{ cursor: 'pointer' }} onClick={() => props.onNameClick(ingredient)}>
          {ingredient.name}
        </label>
        <span style={{ color: color }}>
          <Fa class={styles['ingredient-state-icon']} icon={icon} />
        </span>

        <div class={styles['note-controls']}>
          {props.onEdit ? (
            <button
              class={`${styles['edit-control']} ${styles['note-control']}`}
              onClick={() => props.onEdit!(ingredient)}>
              <Fa icon={faPenToSquare} />
            </button>
          ) : null}
          {props.onDelete ? (
            <button
              class={`${styles['delete-control']} ${styles['note-control']}`}
              onClick={() => props.onDelete!(ingredient)}>
              <Fa icon={faXmark} />
            </button>
          ) : null}
        </div>
      </div>
      <div class={styles['note-tags']}>
        <For each={ingredient.tags}>
          {tag => (
            <label class={`${styles['note-tag']} ${appStyles.button}`} onClick={() => props.onTagClicked(tag)}>
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
                  onClick={() => props.onRelatedIngredientClicked(related.id!)}>
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
