import Fa from 'solid-fa'

import { State } from '../types'
import { renderState } from '../utils'

import styles from './RecipeComponent.module.css'

export type Props = {
  state: State

  iconClass?: string | undefined
}

export default (props: Props) => {
  const [stateIcon, stateColor] = renderState(props.state)

  const classes = props.iconClass ?? styles['ingredient-state-icon']

  return (
    <span style={{ color: stateColor }} title={props.state}>
      <Fa class={classes} icon={stateIcon} />
    </span>
  )
}
