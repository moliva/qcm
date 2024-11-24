import Fa from 'solid-fa'
import { faKey } from '@fortawesome/free-solid-svg-icons'

import { API_HOST } from '../services'

import { createMemo, Match, Switch } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { getCookie, parseIdToken, setCookie } from '../utils'

import styles from '../App.module.css'
import navStyles from './NavComponent.module.css'

export type LoginProps = {}

export function Login() {
  let idToken = getCookie('idToken')
  let refreshToken = getCookie('refreshToken')

  const location = useLocation()
  const path = createMemo(() => location.pathname.split('/').slice(2).join('/'))

  if (idToken !== null && idToken.length > 0) {
    const token = parseIdToken(idToken)
    if (new Date() < new Date(token.exp * 1000)) {
      window.location.replace(
        import.meta.env.BASE_URL + `?login_success=${idToken}&redirect=${encodeURIComponent(path() + location.search)}`
      )
      // } else if (refreshToken !== null && refreshToken.length > 0) {
      //   fetch(`${API_HOST}/refresh`, {
      //     method: 'PUT',
      //     mode: 'cors', // no-cors, *cors, same-origin
      //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      //     body: JSON.stringify(refreshToken),
      //     headers: {
      //       'content-type': 'application/json'
      //     }
      //   })
      //     .then(r => r.json())
      //     .then(json => {
      //       const { id_token: refreshedToken } = json
      //
      // if (!refreshedToken || refreshedToken === null) {
      // debugger
      //}
      //
      //       window.location.replace(
      //         import.meta.env.BASE_URL +
      //           `?login_success=${refreshedToken}&redirect=${encodeURIComponent(path() + location.search)}`
      //       )
      //     })
    } else {
      setCookie('idToken', '', 1)
      idToken = ''
    }
  }

  return (
    <Switch
      fallback={
        <div class={styles['redirect-container']}>
          <label class={`${styles.link} ${navStyles.login} ${styles.login}`}>Redirecting...</label>
          <a style={{ color: 'var(--middle)' }} href={`${API_HOST}/login`} class={`${styles.link} ${navStyles.login}`}>
            <Fa class={styles['nav-icon']} icon={faKey} /> Login
          </a>
        </div>
      }>
      <Match when={idToken === null || idToken.length === 0}>
        <div
          class={styles['login-container']}
          style={{ 'min-height': '100vh', 'align-items': 'center', display: 'flex', 'justify-content': 'center' }}>
          <a href={`${API_HOST}/login`} class={`${styles.link} ${navStyles.login} ${styles.login}`}>
            <Fa class={styles['nav-icon']} icon={faKey} /> Login
          </a>
        </div>
      </Match>
    </Switch>
  )
}
