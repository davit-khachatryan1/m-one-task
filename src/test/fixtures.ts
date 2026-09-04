import type { User } from '../users/types/user/user'

export const sampleUser: User = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
  },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
}

export function makeUser(id: number, name: string, email: string, city: string): User {
  return {
    ...sampleUser,
    id,
    name,
    username: `user${id}`,
    email,
    address: {
      ...sampleUser.address,
      city,
      geo: { ...sampleUser.address.geo },
    },
    company: {
      ...sampleUser.company,
      name: `Company ${id}`,
    },
  }
}
