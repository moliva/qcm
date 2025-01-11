import { createMemo } from 'solid-js'
import { useLocation, useNavigate } from '@solidjs/router'

import Fa from 'solid-fa'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavTabProps = {
  title: string
  path: string
  icon: IconDefinition
  style: string
}

/**
 * Tab link for the navigation bar.
 */
export default function (props: NavTabProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const path = createMemo(() => location.pathname.split('/').slice(2).join('/'))

  return (
    <button
      title={props.title}
      class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']} ${styles['nav-button']} ${path() === props.path ? appStyles.selected : null}`}
      onClick={() => navigate(import.meta.env.BASE_URL + props.path)}>
      <Fa
        class={`${styles['nav2-icon']} ${props.style} ${path() === props.path ? appStyles.selected : null}`}
        icon={props.icon}
      />
    </button>
  )
}
