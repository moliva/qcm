import { useLocation } from '@solidjs/router'

import Fa from 'solid-fa'
import { faKey } from '@fortawesome/free-solid-svg-icons'

import { API_HOST } from '../services'

import styles from '../App.module.css'
import navStyles from './NavComponent.module.css'

export type LoginProps = {}

export function Login(_props: LoginProps) {
  const location = useLocation()
  const encoded = encodeURIComponent(location.pathname.replace('/qcm', ''))

  return (
    <div
      class={styles['login-container']}
      style={{ 'min-height': '100vh', 'align-items': 'center', display: 'flex', 'justify-content': 'center' }}>
      <a
        href={`${API_HOST}/login?redirect=${encoded}`}
        target='_self'
        class={`${styles.link} ${navStyles.login} ${styles.login}`}>
        <Fa class={styles['nav-icon']} icon={faKey} /> Login
      </a>
    </div>
  )
}
