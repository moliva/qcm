import Fa from 'solid-fa'
import { faKey } from '@fortawesome/free-solid-svg-icons'

import { API_HOST } from '../services'

import styles from '../App.module.css'
import navStyles from './NavComponent.module.css'
import { createMemo, Match, Switch } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { getCookie, parseIdToken, setCookie } from '../utils'

export type LoginProps = {}

export function Login() {
  let idToken = getCookie('idToken')

  const location = useLocation()
  const path = createMemo(() => location.pathname.split('/').slice(2).join('/'))

  if (idToken !== null && idToken.length > 0) {
    const token = parseIdToken(idToken)
    if (new Date() < new Date(token.exp * 1000)) {
      window.location.replace(import.meta.env.BASE_URL + `?login_success=${idToken}&redirect=${path()}`)
    } else {
      setCookie('idToken', '', 1)
      idToken = ''
    }
  }

  return (
    <Switch
      fallback={
        <div
          style={{
            display: 'flex',
            'flex-direction': 'column',
            'min-height': '100vh',
            'align-items': 'center',
            'justify-content': 'center'
          }}>
          <label class={`${styles.link} ${navStyles.login}`} style={{ 'font-size': '30px', 'font-weight': 'bold' }}>
            Redirecting...
          </label>
          <a style={{ color: 'grey' }} href={`${API_HOST}/login`} class={`${styles.link} ${navStyles.login}`}>
            <Fa class={styles['nav-icon']} icon={faKey} /> Login
          </a>
        </div>
      }>
      <Match when={idToken === null || idToken.length === 0}>
        <div style={{ 'min-height': '100vh', 'align-items': 'center', display: 'flex', 'justify-content': 'center' }}>
          <a
            href={`${API_HOST}/login`}
            class={`${styles.link} ${navStyles.login}`}
            style={{ 'font-size': '30px', 'font-weight': 'bold' }}>
            <Fa class={styles['nav-icon']} icon={faKey} /> Login
          </a>
        </div>
      </Match>
    </Switch>
  )
}
