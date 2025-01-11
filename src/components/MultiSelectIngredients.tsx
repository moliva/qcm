import { Setter } from 'solid-js'

import MultiSelect, { Ref } from '@moliva/solid-multiselect'
import { useAppContext } from '../context'
import { Ingredient } from '../types'

export type MultiSelectIngredientProps = {
  ref?: Setter<Ref<Ingredient>>
  selectedValues?: Ingredient[] | undefined
}

export default (props: MultiSelectIngredientProps) => {
  const [state] = useAppContext()

  return (
    <MultiSelect
      ref={props.ref}
      // onSelect={props.onChange}
      // onRemove={props.onChange}
      emptyRecordMsg='No ingredients'
      options={Object.values(state().ingredients ?? [])}
      isObject
      avoidHighlightFirstOption={true}
      displayValue='name'
      renderValue={(member: Ingredient) => <label>{member.name}</label>}
      selectedValues={props.selectedValues}
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
  )
}
