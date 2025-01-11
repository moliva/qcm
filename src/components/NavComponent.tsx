import { Accessor, createEffect, onCleanup, onMount } from 'solid-js'
import { useLocation, useNavigate, useSearchParams } from '@solidjs/router'

import Fa from 'solid-fa'
import {
  faUnlockKeyhole,
  faAngleLeft,
  faMagnifyingGlass,
  faBlender,
  faCarrot,
  faFilter
} from '@fortawesome/free-solid-svg-icons'

import { Identity } from '@moliva/auth.ts'

import { SearchOptions } from '../types'

import { ProfilePicture } from './ProfilePicture'
import NavTab from './NavTab'

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'
import { API_HOST } from '../services'

export type NavBarProps = {
  identity: Identity
  searchOptions: Accessor<SearchOptions>

  onSearchTermChanged(searchTerm: string): void
  onSearchClicked(searchTerm: string): void
  onFilterClicked(): void
}

/**
 * Navigation bar.
 */
export const NavBar = (props: NavBarProps) => {
  const { identity } = props

  let searchTermRef: any

  const navigate = useNavigate()
  const location = useLocation()

  const [searchParams, _setSearchParams] = useSearchParams()

  createEffect(async () => {
    if (searchParams.keywords) {
      const searchTerm = decodeURI(searchParams.keywords)

      if (searchTerm && searchTermRef && searchTerm !== searchTermRef.value) {
        searchTermRef.value = searchTerm
        props.onSearchTermChanged(searchTerm)
      }
    }
  })

  const goBack = () => {
    if (location.pathname === import.meta.env.BASE_URL) {
      navigate(-1)
    } else {
      navigate(import.meta.env.BASE_URL)
    }
  }
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      const ref = searchTermRef

      if (ref) {
        ref.focus()
      }
    }
  }

  onMount(() => window.addEventListener('keydown', handleKeydown, true))
  onCleanup(() => window.removeEventListener('keydown', handleKeydown))

  return (
    <>
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
              class={styles['search-input']}
              onInput={() => {
                props.onSearchTermChanged(searchTermRef!.value)
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  props.onSearchClicked(searchTermRef!.value)
                }
              }}
              value={props.searchOptions().keywords.join(' ')}
            />
            <button
              title='Filter'
              style={{ padding: '0', 'margin-left': '5px' }}
              class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.back}`}
              onClick={props.onFilterClicked}>
              <Fa class={`${styles['nav-icon']} ${styles['filter']}`} icon={faFilter} />
            </button>
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
                href={`${API_HOST}/logout`}>
                <Fa class={styles['nav-icon']} icon={faUnlockKeyhole} />
              </a>
            </div>
            <ProfilePicture title={identity.identity.name} picture={identity.identity.picture} />
          </div>
        </div>
        <div class={styles['nav-main']} style={{ 'align-items': 'center', 'justify-content': 'center' }}>
          <NavTab title='Recipes' path='recipes' style={appStyles.recipes} icon={faBlender} />
          <NavTab title='Ingredients' path='ingredients' style={appStyles.ingredients} icon={faCarrot} />
        </div>
      </nav>
    </>
  )
}
