import { For, onMount, Switch, Match, Show, onCleanup, createEffect, lazy, createSignal } from 'solid-js'
import { useNavigate, useSearchParams, Routes, Route, Navigate } from '@solidjs/router'

import { useAppContext } from './context'
import { SearchOptions } from './types'
import { formatError, getCookie, parseIdToken, setCookie } from './utils'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import EditSearchOptions from './components/EditSearchOptions'

import styles from './App.module.css'

const RecipePage = lazy(() => import('./pages/Recipe'))
const IngredientPage = lazy(() => import('./pages/Ingredient'))
const RecipesPage = lazy(() => import('./pages/Recipes'))
const IngredientsPage = lazy(() => import('./pages/Ingredients'))
const SearchPage = lazy(() => import('./pages/Search'))

function cleanUp() {
  localStorage.removeItem('idToken')
  localStorage.removeItem('name')
  localStorage.removeItem('picture')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('accessToken')
}

export default () => {
  const [state, { setState, setError }] = useAppContext()

  const navigate = useNavigate()

  // TODO(miguel): remove - 2024/11/23
  cleanUp()

  // handle auth
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.login_success

  const [redirect, setRedirect] = createSignal<string | undefined>()

  if (!state().identity && typeof token === 'string') {
    const oldId = getCookie('idToken')

    try {
      let identity = parseIdToken(token)
      setCookie('idToken', token, 7)

      if (oldId != null) {
        const oldIdentity = parseIdToken(oldId)

        identity = {
          ...oldIdentity,
          ...identity
        }

        const name = getCookie('name')
        if (name) {
          identity.name = name
        }
        const picture = getCookie('picture')
        if (picture) {
          identity.picture = picture
        }
      }
      if (identity.name) {
        setCookie('name', identity.name)
      }
      if (identity.picture) {
        setCookie('picture', identity.picture)
      }

      const accessToken = searchParams.access_token
      if (accessToken) {
        setCookie('accessToken', accessToken, 7)
      }

      const refreshToken = searchParams.refresh_token
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, 7)
      }

      const newIdentityState = { identity, token }

      const redirect_ = searchParams.redirect
      if (redirect_ && redirect_.length > 0) {
        setRedirect(decodeURIComponent(redirect_))
      }

      setState({ ...state(), identity: newIdentityState })
      setSearchParams({})
    } catch (e) {
      setError(formatError(`Error while parsing id token ${token}`, e))
    }
  }

  createEffect(async alreadyFetched => {
    if (alreadyFetched) return

    const identity = state().identity

    if (identity) {
      // const currencies = await doFetchCurrencies(identity!)
      // setState({ ...state(), currencies: Object.fromEntries(currencies.map(c => [c.id, c])) })

      return true
    }

    return false
  }, false)

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      return false
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  async function onSearchClicked(searchTerm: string) {
    const states = searchOptions().states.join(' ')
    const kinds = searchOptions().kinds.join(' ')
    const query = `keywords=${searchTerm}&states=${states}&kinds=${kinds}`
    navigate(import.meta.env.BASE_URL + `search?${query}`)
  }

  const [showSearchOptionsModal, setShowSearchOptionsModal] = createSignal(false)
  const [searchOptions, setSearchOptions] = createSignal<SearchOptions>({
    keywords: (searchParams.keywords ?? '').split(' '),
    states: ['good', 'bad', 'unknown', 'warning'],
    kinds: ['ingredient', 'recipe']
  })

  // init search options when coming from a permalink with them
  const path = redirect()
  if (path && path.startsWith('search') && path.includes('?')) {
    const searchParams = new URLSearchParams(path.substring(path.indexOf('?')))

    let searchOptions = {} as Record<string, string[]>
    for (const searchParam of searchParams) {
      searchOptions[searchParam[0]] = searchParam[1].split(' ')
    }

    setSearchOptions(searchOptions as SearchOptions)
  }

  function onFilterClicked() {
    setShowSearchOptionsModal(true)
  }

  function updateSearchOptions(options: SearchOptions) {
    setSearchOptions(options)
    setShowSearchOptionsModal(false)

    onSearchClicked(searchOptions().keywords.join(' '))
  }

  function onSearchTermChanged(searchTerm: string) {
    setSearchOptions({ ...searchOptions(), keywords: searchTerm.split(' ') })
  }

  onMount(() => {
    if (redirect()) {
      navigate(import.meta.env.BASE_URL + redirect())
    }
  })

  return (
    <div class={styles.App}>
      <Show when={state().error !== undefined}>
        <div class={styles['error-float']}>
          <div class={styles['error-toast']}>
            <For each={state().error!.split('\n')}>{errorLine => <label>{errorLine}</label>}</For>
            <button class={styles['error-clear']} onClick={() => setError()}>
              Clear
            </button>
          </div>
        </div>
      </Show>
      <Switch fallback={<Login />}>
        <Match when={typeof state().identity !== 'undefined'}>
          <header class={styles.header}>
            <Nav
              identity={state().identity!}
              searchOptions={searchOptions}
              onSearchTermChanged={onSearchTermChanged}
              onSearchClicked={onSearchClicked}
              onFilterClicked={onFilterClicked}
            />
            <hr class={styles['divider']} />
          </header>
          <main class={styles.main}>
            <section class={styles.content}>
              <Show when={showSearchOptionsModal()}>
                <EditSearchOptions
                  searchOptions={searchOptions}
                  onDiscard={() => setShowSearchOptionsModal(false)}
                  onConfirm={updateSearchOptions}
                />
              </Show>
              <Routes>
                <Route path={import.meta.env.BASE_URL}>
                  <Route path='/' component={<Navigate href={import.meta.env.BASE_URL + `recipes`} />} />
                  <Route path='/recipes' component={RecipesPage} />
                  <Route path='/ingredients' component={IngredientsPage} />
                  <Route path='/recipes/:id' component={RecipePage} />
                  <Route path='/ingredients/:id' component={IngredientPage} />
                  <Route path='/search' component={SearchPage} />
                </Route>
              </Routes>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
