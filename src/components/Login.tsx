import Fa from 'solid-fa'
import { faKey } from '@fortawesome/free-solid-svg-icons'

import { API_HOST } from '../services'

import styles from '../App.module.css'
import navStyles from './NavComponent.module.css'
import { createMemo, Match, Switch } from 'solid-js'
import { useLocation } from '@solidjs/router'

export type LoginProps = {}

export function Login() {
  const idToken = getCookie('idToken')

  const location = useLocation()
  const path = createMemo(() => location.pathname.split('/').slice(2).join('/'))

  if (idToken !== undefined && idToken.length > 0) {
    window.location.replace(import.meta.env.BASE_URL + `?login_success=${idToken}&redirect=${path()}`)
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
      <Match when={idToken === undefined || idToken.length === 0}>
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

function getCookie(cname: string): string {
  let name = cname + '='
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
