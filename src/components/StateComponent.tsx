import Fa from 'solid-fa'

import { State } from '../types'
import { renderState } from '../utils'

import styles from './RecipeComponent.module.css'

export type Props = {
  state: State
}

export default (props: Props) => {
  const [stateIcon, stateColor] = renderState(props.state)

  return (
    <span style={{ color: stateColor }} title={props.state}>
      <Fa class={styles['ingredient-state-icon']} icon={stateIcon} />
    </span>
  )
}
