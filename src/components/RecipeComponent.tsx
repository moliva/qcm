import { For } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { Recipe } from '../types'
import { useAppContext } from '../context'

import styles from './RecipeComponent.module.css'
import appStyles from '../App.module.css'
import { renderKind, renderState } from '../utils'

export type RecipeComponentProps = {
  recipe: Recipe

  onNameClick(recipe: Recipe): void
  onTagClicked(tag: string): void

  onEdit?: ((recipe: Recipe) => void) | undefined
  onDelete?: ((recipe: Recipe) => void) | undefined
}

export const RecipeComponent = (props: RecipeComponentProps) => {
  const { recipe } = props
  const [state, { setError, setIngredients }] = useAppContext()

  const navigate = useNavigate()

  const [stateIcon, stateColor] = renderState(recipe.state)
  const [kindIcon, kindColor] = renderKind('recipe')

  return (
    <div class={styles.recipe}>
      <div class={styles['ingredient-name']}>
        <span style={{ color: kindColor }}>
          <Fa class={styles['ingredient-kind-icon']} icon={kindIcon} />
        </span>
        <label style={{ cursor: 'pointer' }} onClick={() => props.onNameClick(recipe)}>
          {recipe.name}
        </label>
        <span style={{ color: stateColor }}>
          <Fa class={styles['ingredient-state-icon']} icon={stateIcon} />
        </span>
        <div class={styles['note-controls']}>
          {props.onEdit ? (
            <button class={`${styles['edit-control']} ${styles['note-control']}`} onClick={() => props.onEdit!(recipe)}>
              <Fa icon={faPenToSquare} />
            </button>
          ) : null}
          {props.onDelete ? (
            <button
              class={`${styles['delete-control']} ${styles['note-control']}`}
              onClick={() => props.onDelete!(recipe)}>
              <Fa icon={faXmark} />
            </button>
          ) : null}
        </div>
      </div>
      <div class={styles['note-tags']}>
        <For each={recipe.tags}>
          {tag => (
            <label class={`${styles['note-tag']} ${appStyles.button}`} onClick={() => props.onTagClicked(tag)}>
              {tag}
            </label>
          )}
        </For>
      </div>
      <label class={styles['ingredient-subtitle']}>Ingredients</label>
      <div class={styles['ingredient-related-set']}>
        {state().ingredients ? (
          <For
            each={recipe.ingredients.map(
              ({ ingredient: id, measure }) => [state().ingredients![id], measure] as const
            )}>
            {([related, measure]) => (
              <div style={{ display: 'flex', 'align-items': 'center', gap: '5px' }}>
                <label
                  class={`${styles['ingredient-related']} ${appStyles.button}`}
                  onClick={() => navigate(import.meta.env.BASE_URL + `ingredients/${related.id}`)}>
                  {related.name}
                </label>
                <span>{measure}</span>
              </div>
            )}
          </For>
        ) : null}
      </div>
      <label class={styles['ingredient-subtitle']}>Steps</label>
      <textarea class={styles['ingredient-notes']} readonly={true}>
        {recipe.notes}
      </textarea>
    </div>
  )
}
