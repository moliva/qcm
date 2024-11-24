import Fa from 'solid-fa'

import { Kind } from '../types'
import { renderKind } from '../utils'

import styles from './RecipeComponent.module.css'

export type KindProps = {
  kind: Kind
}

export default (props: KindProps) => {
  const [kindIcon, kindColor] = renderKind(props.kind)

  return (
    <span style={{ color: kindColor }}>
      <Fa class={styles['ingredient-kind-icon']} icon={kindIcon} />
    </span>
  )
}
