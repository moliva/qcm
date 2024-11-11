import {
  Identity,
  NotificationsUpdate,
  Group,
  Currency,
  DetailedGroup,
  Notification,
  NotificationAction,
  Expense,
  Balance,
  NotificationUpdate,
  Ingredient,
  Recipe
} from './types'

export const API_HOST = import.meta.env.VITE_API_URL

type Event = {
  kind: 'group' | 'notification'
  id: number
  field: string
}

export async function fetchSync(identity: Identity): Promise<Event[]> {
  const res = await authentifiedFetch(`${API_HOST}/sync`, identity!)

  return (await res.json()) as Event[]
}

export async function updateNotifications(update: NotificationsUpdate, identity: Identity): Promise<void> {
  await authentifiedFetch(`${API_HOST}/notifications`, identity, {
    method: 'PUT',
    body: JSON.stringify(update),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function updateNotification(
  notification: Notification,
  update: NotificationUpdate,
  identity: Identity
): Promise<void> {
  await authentifiedFetch(`${API_HOST}/notifications/${notification.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(update),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function updateMembership(status: NotificationAction, group: Group, identity: Identity): Promise<void> {
  await authentifiedFetch(`${API_HOST}/groups/${group.id}/memberships`, identity, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function fetchCurrencies(identity: Identity): Promise<Currency[]> {
  const res = await authentifiedFetch(`${API_HOST}/currencies`, identity!)

  return (await res.json()) as Currency[]
}

export async function fetchRecipes(identity: Identity): Promise<Recipe[]> {
  // const res = await authentifiedFetch(`${API_HOST}/recipes`, identity!)

  // return (await res.json()) as Recipe[]
  return [
    {
      id: 1,
      name: 'sopa crema zapallo',
      state: 'bad',
      tags: ['vegetable', 'sopa'],
      notes: '1- hervir zapallo\n2- mixear bien\n3- disfrutar!',
      ingredients: [[1, 'un poquitou']]
    },
    {
      id: 2,
      name: 'wok salteao',
      state: 'good',
      tags: ['vegetable', 'wok'],
      notes: '1- saltear\n2- gozar',
      ingredients: [
        [3, 'mandale nomás'],
        [2, 'a gusto']
      ]
    }
  ]
}
export async function fetchIngredients(identity: Identity): Promise<Ingredient[]> {
  // const res = await authentifiedFetch(`${API_HOST}/ingredients`, identity!)

  // return (await res.json()) as Ingredient[]
  return [
    {
      id: 1,
      name: 'zapallo',
      state: 'bad',
      tags: ['vegetable', 'pumpkin'],
      notes: 'me cae mal',
      related: [2, 4],
      recipes: [1]
    },
    {
      id: 2,
      name: 'calabacín',
      state: 'good',
      tags: ['vegetable', 'pumpkin'],
      notes: 'joya, pero no me gusta mucho',
      related: [1],
      recipes: [2]
    },
    {
      id: 3,
      name: 'tofu',
      state: 'warning',
      tags: ['protein'],
      notes: 'tiene sus días',
      related: [],
      recipes: [2]
    },
    {
      id: 4,
      name: 'remolacha',
      state: 'unknown',
      tags: ['vegetable'],
      notes: 'ni loca lo pruebo',
      related: [],
      recipes: []
    }
  ]
}

export async function fetchNotifications(identity: Identity): Promise<Notification[]> {
  const res = await authentifiedFetch(`${API_HOST}/notifications`, identity!)

  return (await res.json()) as Notification[]
}

export async function fetchGroup(identity: Identity, id: number): Promise<DetailedGroup> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${id}`, identity!)

  return (await res.json()) as DetailedGroup
}

export async function fetchGroups(identity: Identity): Promise<Group[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups`, identity!)

  return (await res.json()) as Group[]
}

export async function inviteUsers(identity: Identity, group_id: number, emails: string[]): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group_id}/memberships`, identity, {
    method: 'POST',
    body: JSON.stringify({ emails }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function putExpense(expense: Expense, groupId: number, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${expense.group_id}/expenses/${expense.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(expense),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postExpense(expense: Expense, groupId: number, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses`, identity, {
    method: 'POST',
    body: JSON.stringify(expense),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteExpense(expenseId: number, groupId: number, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses/${expenseId}`, identity, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw response
  }
}

export async function fetchExpenses(identity: Identity, groupId: number): Promise<Expense[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses`, identity!)

  return await res.json()
}

export async function fetchBalances(identity: Identity, groupId: number): Promise<Balance[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${groupId}/balances`, identity!)

  return await res.json()
}

export async function putGroup(group: Group, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(group),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postGroup(group: Group, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups`, identity, {
    method: 'POST',
    body: JSON.stringify(group),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postIngredient(ingredient: Ingredient, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/ingredients`, identity, {
    method: 'POST',
    body: JSON.stringify(ingredient),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function putIngredient(ingredient: Ingredient, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/ingredients/${ingredient.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(ingredient),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteIngredient(ingredient: Ingredient, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/ingredients/${ingredient.id}`, identity, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}

export async function deleteGroup(group: Group, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, identity, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}

async function authentifiedFetch(url: string, identity: Identity, init: RequestInit | undefined = {}) {
  return await fetch(url, {
    ...init,
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      Authorization: identity!.token,
      ...init.headers
    }
  })
}
