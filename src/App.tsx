import { For, onMount, Switch, Match, Show, onCleanup, createEffect, lazy, createSignal } from 'solid-js'
import { useNavigate, useSearchParams, Routes, Route, Navigate } from '@solidjs/router'

import { useAppContext } from './context'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import { SearchOptions } from './types'

import EditSearchOptions from './components/EditSearchOptions'

import styles from './App.module.css'

const Home = lazy(() => import('./pages/Home'))
const RecipePage = lazy(() => import('./pages/Recipe'))
const IngredientPage = lazy(() => import('./pages/Ingredient'))
const RecipesPage = lazy(() => import('./pages/Recipes'))
const IngredientsPage = lazy(() => import('./pages/Ingredients'))
const SearchPage = lazy(() => import('./pages/Search'))

export default () => {
  const [state, { setState, setError }] = useAppContext()

  const navigate = useNavigate()

  // handle auth
  const [searchParams] = useSearchParams()
  const token = searchParams.login_success

  if (!state().identity && typeof token === 'string') {
    const idToken = token.split('.')[1]
    const decoded = atob(idToken)
    const identity = JSON.parse(decoded)

    const newIdentityState = { identity, token }

    setState({ ...state(), identity: newIdentityState })
    navigate(import.meta.env.BASE_URL)
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
    keywords: [],
    states: ['good', 'bad', 'unknown', 'warning'],
    kinds: ['ingredient', 'recipe']
  })

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
