import { Kind, State, User } from './types'

import {
  faBlender,
  faCarrot,
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faTriangleExclamation,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'

export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export function renderKind(kind: Kind): [IconDefinition, string] {
  switch (kind) {
    case 'ingredient':
      return [faCarrot, '#ce6100']
    case 'recipe':
      return [faBlender, '#c2c239']
  }
}

export function renderState(state: State): [IconDefinition, string] {
  switch (state) {
    case 'good':
      return [faCircleCheck, 'green']
    case 'bad':
      return [faCircleXmark, 'red']
    case 'warning':
      return [faTriangleExclamation, 'yellow']
    default:
      return [faCircleQuestion, 'lightgrey']
  }
}

export function useNavigateUtils(navigate: any) {
  const searchTag = (tag: string) => {
    navigate(import.meta.env.BASE_URL + `search?keywords=${tag}`)
  }

  return { searchTag }
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const dayNumberToName = (d: number): string => {
  switch (d) {
    case 0:
      return 'Sun'
    case 1:
      return 'Mon'
    case 2:
      return 'Tue'
    case 3:
      return 'Wed'
    case 4:
      return 'Thu'
    case 5:
      return 'Fri'
    case 6:
      return 'Sat'
    default:
      throw 'day number out of range'
  }
}

export const monthNumberToName = (m: string): string => {
  switch (m) {
    case '01':
      return 'January'
    case '02':
      return 'February'
    case '03':
      return 'March'
    case '04':
      return 'April'
    case '05':
      return 'May'
    case '06':
      return 'June'
    case '07':
      return 'July'
    case '08':
      return 'August'
    case '09':
      return 'September'
    case '10':
      return 'October'
    case '11':
      return 'November'
    case '12':
      return 'December'
    default:
      throw `month number out of range ${m}`
  }
}

/**
 * "Polyfill" for Object#groupBy for versions that still don't support this API
 */
function groupBy<T>(array: T[], keySelector: (each: T) => PropertyKey): Partial<Record<PropertyKey, T[]>> {
  if (Object.groupBy) {
    return Object.groupBy(array, keySelector)
  } else {
    console.debug('Object#groupBy not found, using own version')
    const grouped: Record<PropertyKey, T[]> = {}

    for (const each of array) {
      const key = keySelector(each)
      let values = grouped[key]
      if (values) {
        values.push(each)
      } else {
        grouped[key] = [each]
      }
    }

    return grouped
  }
}

export function userName(user: User): string {
  const indexBlank = user.name.indexOf(' ')

  return user.name.slice(0, indexBlank == -1 ? 0 : indexBlank)
}

export function formatError(contextMessage: string, e: any): string {
  return `${contextMessage}\n\n${JSON.stringify(e?.stack ?? e?.message ?? e)}`
}
