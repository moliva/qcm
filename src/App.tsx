import { For, onMount, Switch, Match, Show, onCleanup, lazy, createSignal } from 'solid-js'
import { useNavigate, Routes, Route, Navigate, useSearchParams } from '@solidjs/router'

import { handleAuth } from '@moliva/auth.ts'

import { useAppContext } from './context'
import { SearchOptions } from './types'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import EditSearchOptions from './components/EditSearchOptions'

import styles from './App.module.css'

const RecipePage = lazy(() => import('./pages/Recipe'))
const IngredientPage = lazy(() => import('./pages/Ingredient'))
const RecipesPage = lazy(() => import('./pages/Recipes'))
const IngredientsPage = lazy(() => import('./pages/Ingredients'))
const SearchPage = lazy(() => import('./pages/Search'))

export default () => {
  const [state, { setState, setError }] = useAppContext()

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  // handle auth
  handleAuth(state, setState)

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
    const onlyCurrentIngredients = searchOptions().onlyCurrentIngredients
    const ingredients = searchOptions().ingredients.join(' ')
    const query = `keywords=${searchTerm}&states=${states}&kinds=${kinds}&onlyCurrentIngredients=${onlyCurrentIngredients}&ingredients=${ingredients}`

    navigate(import.meta.env.BASE_URL + `search?${query}`)
  }

  const [showSearchOptionsModal, setShowSearchOptionsModal] = createSignal(false)
  const [searchOptions, setSearchOptions] = createSignal<SearchOptions>({
    keywords: (searchParams.keywords ?? '').split(' '),
    states: ['good', 'bad', 'unknown', 'warning'],
    kinds: ['ingredient', 'recipe'],

    onlyCurrentIngredients: false,
    ingredients: []
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
                  <Route path='/recipes' component={RecipesPage} />
                  <Route path='/recipes/:id' component={RecipePage} />
                  <Route path='/ingredients' component={IngredientsPage} />
                  <Route path='/ingredients/:id' component={IngredientPage} />
                  <Route path='/search' component={SearchPage} />

                  <Route path='/' component={() => <Navigate href={import.meta.env.BASE_URL + `recipes`} />} />
                </Route>
              </Routes>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
