import { Accessor, createEffect, createMemo, onCleanup, onMount } from 'solid-js'
import { useLocation, useNavigate, useSearchParams } from '@solidjs/router'

import {
  faUnlockKeyhole,
  faAngleLeft,
  faMagnifyingGlass,
  faBlender,
  faCarrot,
  faFilter
} from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { Identity, SearchOptions } from '../types'

import { ProfilePicture } from './ProfilePicture'

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity
  searchOptions: Accessor<SearchOptions>

  onSearchTermChanged(searchTerm: string): void
  onSearchClicked(searchTerm: string): void
  onFilterClicked(): void
}

export const Nav = (props: NavProps) => {
  const { identity } = props

  let searchTermRef: any

  const navigate = useNavigate()
  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()

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

  const path = createMemo(() => location.pathname.split('/').slice(2).join('/'))

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
              style={{
                width: '100%',
                'max-width': '600px',
                'border-style': 'solid',
                'border-width': '1px',
                'border-radius': '5px',
                'border-color': '#3b3b3b'
              }}
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
                href={import.meta.env.BASE_URL}>
                <Fa class={styles['nav-icon']} icon={faUnlockKeyhole} />
              </a>
            </div>
            <ProfilePicture title={identity.identity.name} picture={identity.identity.picture} />
          </div>
        </div>
        <div class={styles['nav-main']} style={{ 'align-items': 'center', 'justify-content': 'center' }}>
          {/**
        <button
          title='Home'
          class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']} ${path() === '' ? appStyles.selected : null}`}
          onClick={() => navigate(import.meta.env.BASE_URL)}>
          <Fa 
            class={`${styles['nav2-icon']} ${path() === '' ? appStyles.home : null}`}
          icon={faHouse} />
        </button>
      */}
          <button
            title='Recipes'
            class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']} ${path() === 'recipes' ? appStyles.selected : null}`}
            onClick={() => navigate(`${import.meta.env.BASE_URL}recipes`)}>
            <Fa class={`${styles['nav2-icon']} ${path() === 'recipes' ? appStyles.recipes : null}`} icon={faBlender} />
          </button>
          <button
            title='Ingredients'
            class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']} ${styles['nav-button']} ${path() === 'ingredients' ? appStyles.selected : null}`}
            onClick={() => navigate(`${import.meta.env.BASE_URL}ingredients`)}>
            <Fa
              class={`${styles['nav2-icon']} ${path() === 'ingredients' ? appStyles.ingredients : null}`}
              icon={faCarrot}
            />
          </button>
        </div>
      </nav>
    </>
  )
}
