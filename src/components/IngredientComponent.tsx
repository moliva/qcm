import { For } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { Ingredient, IngredientId } from '../types'
import { useAppContext } from '../context'

import KindComponent from './KindComponent'
import StateComponent from './StateComponent'

import recipeStyles from './RecipeComponent.module.css'
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
  const [state] = useAppContext()

  const navigate = useNavigate()

  return (
    <div class={recipeStyles.recipe}>
      <div class={recipeStyles['ingredient-name']}>
        <KindComponent kind='ingredient' />
        <label style={{ cursor: 'pointer' }} onClick={() => props.onNameClick(ingredient)}>
          {ingredient.name}
        </label>
        <StateComponent state={ingredient.state} />

        <div class={recipeStyles['note-controls']}>
          {props.onEdit ? (
            <button
              class={`${recipeStyles['edit-control']} ${recipeStyles['note-control']}`}
              onClick={() => props.onEdit!(ingredient)}
              title='Edit'>
              <Fa icon={faPenToSquare} />
            </button>
          ) : null}
          {props.onDelete ? (
            <button
              class={`${recipeStyles['delete-control']} ${recipeStyles['note-control']}`}
              onClick={() => props.onDelete!(ingredient)}
              title='Delete'>
              <Fa icon={faXmark} />
            </button>
          ) : null}
        </div>
      </div>
      <div class={recipeStyles['note-tags']}>
        <For each={ingredient.tags}>
          {tag => (
            <label class={`${recipeStyles['note-tag']} ${appStyles.button}`} onClick={() => props.onTagClicked(tag)}>
              {tag}
            </label>
          )}
        </For>
      </div>
      <textarea class={recipeStyles['ingredient-notes']} readonly={true}>
        {ingredient.notes}
      </textarea>
      {ingredient.related.length > 0 ? (
        <>
          <label class={recipeStyles['ingredient-subtitle']}>Related</label>
          <div class={recipeStyles['ingredient-related-set']}>
            <For each={ingredient.related.map(id => state().ingredients![id])}>
              {related => (
                <label
                  class={`${recipeStyles['ingredient-related']} ${appStyles.button}`}
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
          <label class={recipeStyles['ingredient-subtitle']}>Recipes</label>
          <div class={recipeStyles['ingredient-related-set']}>
            <For each={ingredient.recipes.map(id => state().recipes![id])}>
              {recipe => (
                <label
                  class={`${recipeStyles['ingredient-related']} ${appStyles.button}`}
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
