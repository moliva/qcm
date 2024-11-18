import { Accessor, createSignal, For, onCleanup, onMount } from 'solid-js'

import { Ingredient, Kind, SearchOptions, State } from '../types'
import { useAppContext } from '../context'

import MultiSelect, { Ref } from '@moliva/solid-multiselect'

import appStyles from '../App.module.css'
import styles from './EditSearchOptions.module.css'
import { renderKind, renderState } from '../utils'
import Fa from 'solid-fa'

export type EditSearchOptionsProps = {
  searchOptions: Accessor<SearchOptions>

  onConfirm(searchOptions: SearchOptions): void
  onDiscard(): void
}

export default (props: EditSearchOptionsProps) => {
  const { searchOptions } = props

  const stateOptions = ['unknown', 'good', 'warning', 'bad'] as State[]
  const kindOptions = ['recipe', 'ingredient'] as Kind[]

  let searchTerm
  const stateChecked = Object.fromEntries(stateOptions.map(e => [e, undefined]))
  const kindChecked = Object.fromEntries(kindOptions.map(e => [e, undefined]))

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      props.onDiscard()
      return false
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  function onConfirm() {
    const keywords = searchTerm!.value.split(' ')
    const states = Object.entries(stateChecked)
      .filter(([, ref]) => ref.checked)
      .map(([e]) => e) as State[]
    const kinds = Object.entries(kindChecked)
      .filter(([, ref]) => ref.checked)
      .map(([e]) => e) as Kind[]

    props.onConfirm({ keywords, states, kinds })
  }

  return (
    <div class={styles.modal}>
      <div
        class={styles['modal-content']}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            onConfirm()
          }
        }}>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label>Keywords</label>
          <input
            style={{
              width: '100%',
              'max-width': '600px',
              'border-style': 'solid',
              'border-width': '1px',
              'border-radius': '5px',
              'border-color': '#3b3b3b'
            }}
            ref={searchTerm}
            value={searchOptions().keywords.join(' ')}
          />
        </div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label>States</label>
          <For each={stateOptions}>
            {state => {
              const [icon, color] = renderState(state)

              return (
                <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '2px' }}>
                  <input
                    type='checkbox'
                    ref={stateChecked[state]}
                    class={styles['modal-name']}
                    checked={!!searchOptions().states.find(e => e === state)}
                  />
                  <label>{state}</label>
                  <span style={{ color }}>
                    <Fa class={styles['ingredient-state-icon']} icon={icon} />
                  </span>
                </div>
              )
            }}
          </For>
        </div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
          <label>Kinds</label>
          <For each={kindOptions}>
            {kind => {
              const [icon, color] = renderKind(kind)

              return (
                <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '2px' }}>
                  <input
                    type='checkbox'
                    ref={kindChecked[kind]}
                    class={styles['modal-name']}
                    checked={!!searchOptions().kinds.find(e => e === kind)}
                  />
                  <label>{kind} </label>
                  <span style={{ color }}>
                    <Fa class={styles['ingredient-state-icon']} icon={icon} />
                  </span>
                </div>
              )
            }}
          </For>
        </div>
        <hr class={styles.divider} />
        <div class={styles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>
            Search
          </button>
          <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onDiscard}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

export function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .filter(line => line.length)
    .map(line => line.trim().toLowerCase())
}
