import { For, onMount, Switch, Match, Show, onCleanup, createEffect, lazy } from 'solid-js'
import { useNavigate, useSearchParams, Routes, Route } from '@solidjs/router'

import { useAppContext } from './context'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'

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
    navigate(import.meta.env.BASE_URL + `search?keywords=${searchTerm}`)
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
            <Nav identity={state().identity!} onSearchClicked={onSearchClicked} />
            <hr class={styles['divider']} />
          </header>
          <main class={styles.main}>
            <section class={styles.content}>
              <Routes>
                <Route path={import.meta.env.BASE_URL}>
                  <Route path='/' component={Home} />
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
