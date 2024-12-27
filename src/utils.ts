import {
  faBlender,
  faCarrot,
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faTriangleExclamation,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'

import { Kind, State, User } from './types'

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
      return [faCircleCheck, '#7fc87f']
    case 'bad':
      return [faCircleXmark, '#c65a5a']
    case 'warning':
      return [faTriangleExclamation, '#caca21']
    default:
      return [faCircleQuestion, '#b4b4b4']
  }
}

export function decodeArgument(arg: string | undefined): string[] {
  return arg ? decodeURI(arg).split(' ') : []
}

export function useNavigateUtils(navigate: any) {
  const searchTag = (tag: string) => {
    navigate(
      import.meta.env.BASE_URL + `search?keywords=${tag}&states=good,bad,warning,unknown&kinds=ingredient,recipe`
    )
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

export function userName(user: User): string {
  const indexBlank = user.name.indexOf(' ')

  return user.name.slice(0, indexBlank == -1 ? 0 : indexBlank)
}

export function formatError(contextMessage: string, e: any): string {
  return `${contextMessage}\n\n${JSON.stringify(e?.stack ?? e?.message ?? e)}`
}
