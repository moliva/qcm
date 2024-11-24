import Fa from 'solid-fa'

import { Kind } from '../types'
import { renderKind } from '../utils'

import styles from './RecipeComponent.module.css'

export type KindProps = {
  kind: Kind

  iconClass?: string | undefined
}

export default (props: KindProps) => {
  const [kindIcon, kindColor] = renderKind(props.kind)

  const classes = props.iconClass ?? styles['ingredient-kind-icon']

  return (
    <span style={{ color: kindColor }} title={props.kind}>
      <Fa class={classes} icon={kindIcon} />
    </span>
  )
}
