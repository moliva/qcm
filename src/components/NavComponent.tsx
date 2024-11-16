import { Resource } from 'solid-js'
import { useLocation, useNavigate } from '@solidjs/router'

import {
  faUnlockKeyhole,
  faAngleLeft,
  faMagnifyingGlass,
  faBlender,
  faCarrot,
  faHouse
} from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { Identity } from '../types'

import { ProfilePicture } from './ProfilePicture'

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity

  onSearchClicked(searchTerm: string): void
}

export const Nav = (props: NavProps) => {
  const { identity } = props

  let searchTermRef

  const navigate = useNavigate()
  const location = useLocation()

  const goBack = () => {
    if (location.pathname === import.meta.env.BASE_URL) {
      navigate(-1)
    } else {
      navigate(import.meta.env.BASE_URL)
    }
  }

  return (
    <nav class={styles.nav}>
      <div class={styles['nav-main']}>
        <div class={styles['nav-left-controls']}>
          <button
            title='Go back'
            class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.back}`}
            onClick={goBack}>
            <Fa class={styles['nav-icon']} icon={faAngleLeft} />
          </button>
        </div>
        <div class={styles['nav-app-controls']}>
          <input
            ref={searchTermRef}
            style={{
              width: '100%',
              'max-width': '600px',
              'border-style': 'solid',
              'border-width': '1px',
              'border-radius': '5px',
              'border-color': '#3b3b3b'
            }}
          />
          <button
            title='Search'
            class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`}
            onClick={() => props.onSearchClicked(searchTermRef!.value)}>
            <Fa class={styles['nav-icon']} icon={faMagnifyingGlass} />
          </button>
        </div>
        <div class={styles['nav-auth-controls']}>
          <div class={styles['nav-auth-actions']}>
            <a
              title='Log out'
              class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.logout}`}
              href={import.meta.env.BASE_URL}>
              <Fa class={styles['nav-icon']} icon={faUnlockKeyhole} />
            </a>
          </div>
          <ProfilePicture title={identity.identity.name} picture={identity.identity.picture} />
        </div>
      </div>
      <div class={styles['nav-main']} style={{ 'align-items': 'center', 'justify-content': 'center' }}>
        <button
          title='Home'
          class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`}
          onClick={() => navigate(import.meta.env.BASE_URL)}>
          <Fa class={styles['nav2-icon']} icon={faHouse} />
        </button>
        <button
          title='Recipes'
          class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`}
          onClick={() => navigate(`${import.meta.env.BASE_URL}recipes`)}>
          <Fa class={styles['nav2-icon']} icon={faBlender} />
        </button>
        <button
          title='Ingredients'
          class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`}
          onClick={() => navigate(`${import.meta.env.BASE_URL}ingredients`)}>
          <Fa class={styles['nav2-icon']} icon={faCarrot} />
        </button>
      </div>
    </nav>
  )
}
