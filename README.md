# fetch-goodies

Fetch but with goodies.

## Install

```sh
npm i fetch-goodies
```

## Usage

Basic usage:

```ts
import { goodies } from 'fetch-goodies'
const fetchWithGoodies = goodies(fetch)
const response = await fetchWithGoodies('https://example.com')
```

Shorthand for verbs:

```ts
await fetchWithGoodies.get('https://example.com')
await fetchWithGoodies.post('https://example.com')
await fetchWithGoodies.put('https://example.com')
```

Typed JSON response with:

```ts
const response = await fetchWithGoodies.post<{ key: 'value' }>(
  'https://example.com'
)
console.log('Looks good?', response.json()!.key === 'value')
```

Common prefix for all requests:

```ts
const fetchWithGoodies = goodies(fetch, {
  urlPrefix: 'https://example.com/api',
})
const response = await fetchWithGoodies('/post')
```

Powerful retry options:

```ts
fetchWithGoodies('https://example.com', {
  retry: {
    count: 5,
    delay: (attempt) => 2 ** attempt * 1000,
    on: ({ error }) => error?.message.includes('Ah Shit, Here We Go Again'),
  },
})
```

Global retry options:

```ts
const fetchWithGoodies = goodies(fetch, {
  retry: { count: 5 },
  forceParseJson: true,
  httpCodesConsideredSuccessful: [
    200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304,
    305, 306, 307, 308,
  ],
  urlPrefix: 'https://example.com',
})
```

Powerful retry options:

```ts
fetchWithGoodies('https://example.com', {
  retry: {
    count: 5,
    delay: (attempt) => 2 ** attempt * 1000,
    on: ({ error }) => error?.message.includes('Ah Shit, Here We Go Again'),
  },
})
```

Can use a polyfilled fetch:

```ts
const fetchWithGoodies = goodies(polyfilledFetch)
```
