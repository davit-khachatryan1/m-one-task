import type { Address, Company, Geo, User } from '../../types/user/user'

const USERS_ENDPOINT = 'https://jsonplaceholder.typicode.com/users'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === 'string'
}

function isGeo(value: unknown): value is Geo {
  return isRecord(value) && hasString(value, 'lat') && hasString(value, 'lng')
}

function isAddress(value: unknown): value is Address {
  return (
    isRecord(value) &&
    hasString(value, 'street') &&
    hasString(value, 'suite') &&
    hasString(value, 'city') &&
    hasString(value, 'zipcode') &&
    isGeo(value.geo)
  )
}

function isCompany(value: unknown): value is Company {
  return (
    isRecord(value) &&
    hasString(value, 'name') &&
    hasString(value, 'catchPhrase') &&
    hasString(value, 'bs')
  )
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    hasString(value, 'name') &&
    hasString(value, 'username') &&
    hasString(value, 'email') &&
    isAddress(value.address) &&
    hasString(value, 'phone') &&
    hasString(value, 'website') &&
    isCompany(value.company)
  )
}

async function readJson(response: Response, resource: string): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error(`The ${resource} service returned invalid JSON.`)
  }
}

export async function fetchUsers(signal: AbortSignal): Promise<User[]> {
  const response = await fetch(USERS_ENDPOINT, { signal })

  if (!response.ok) {
    throw new Error(`Unable to load users (HTTP ${response.status}).`)
  }

  const payload = await readJson(response, 'users')

  if (!Array.isArray(payload) || !payload.every(isUser)) {
    throw new Error('The users service returned an unexpected response.')
  }

  return payload
}
