import {
  HttpStatusCodeConsideredError,
  NoMoreRetriesError,
  RetryConditionNotMetError,
  UrlPrefixNotSupportedError,
} from './errors'
import type {
  GoodiesRequestOptions,
  GoodiesInput,
  RetryParameters,
  GoodiesOptions,
  GoodiesResponse,
} from './types'

const DEFAULT_RETRY_COUNT = 3
const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_RETRY_ON = () => true
const DEFAULT_HTTP_CODES_CONSIDERED_SUCCESSFUL = (statusCode: number) =>
  statusCode >= 200 && statusCode < 300

export const goodies = (
  fetchFunction: typeof fetch,
  {
    urlPrefix,
    httpCodesConsideredSuccessful = DEFAULT_HTTP_CODES_CONSIDERED_SUCCESSFUL,
    retry: { count = DEFAULT_RETRY_COUNT, delay = DEFAULT_RETRY_DELAY } = {},
    forceParseJson = false,
  }: GoodiesOptions = {}
) => {
  const fetchWithGoodies = async <JSONType = any>(
    input: GoodiesInput,
    options: GoodiesRequestOptions = {} as GoodiesRequestOptions
  ): Promise<GoodiesResponse<JSONType>> => {
    if (urlPrefix) {
      if (typeof input === 'string') {
        input = `${urlPrefix}${input}`
      } else {
        throw new UrlPrefixNotSupportedError(
          'urlPrefix is only supported for string inputs'
        )
      }
    }

    const optionsCopy = { ...options } as GoodiesRequestOptions
    if (optionsCopy?.json) {
      optionsCopy.method ??= 'POST'
      optionsCopy.body = JSON.stringify(optionsCopy.json)
      delete optionsCopy.json
      optionsCopy.headers ??= {} as GoodiesRequestOptions['headers']
      optionsCopy.headers = {
        'Content-Type': 'application/json',
        ...optionsCopy.headers,
      } as GoodiesRequestOptions['headers']
    }

    const retry = {
      count,
      delay,
      on: DEFAULT_RETRY_ON,
    } as Required<RetryParameters>
    if (optionsCopy.retry === false) {
      retry.count = 1
    } else if (typeof optionsCopy.retry === 'number') {
      retry.count = optionsCopy.retry
    } else if (typeof optionsCopy.retry === 'object') {
      retry.count = optionsCopy.retry.count ?? DEFAULT_RETRY_COUNT
      retry.delay = optionsCopy.retry.delay ?? DEFAULT_RETRY_DELAY
      retry.on = optionsCopy.retry.on ?? DEFAULT_RETRY_ON
    }

    let response!: Response
    let isNewResponse = false
    while (true) {
      try {
        isNewResponse = false
        // console.debug('Fetching', input, optionsCopy)
        response = await fetchFunction(input, optionsCopy)
        isNewResponse = true
        let isHttpStatusCodeConsideredError = false
        if (Array.isArray(httpCodesConsideredSuccessful)) {
          if (!httpCodesConsideredSuccessful.includes(response.status)) {
            isHttpStatusCodeConsideredError = true
          }
        } else if (!httpCodesConsideredSuccessful(response.status)) {
          isHttpStatusCodeConsideredError = true
        }

        if (isHttpStatusCodeConsideredError) {
          throw new HttpStatusCodeConsideredError()
        }

        break
      } catch (error) {
        retry.count--

        const message =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
            ? error.message
            : 'Unknown error'
        if (retry.count === 0) {
          throw new NoMoreRetriesError('No more retries: ' + message)
        }

        if (
          !retry.on({
            response: isNewResponse ? response : null,
            error,
            retryCount: retry.count,
          })
        ) {
          throw new RetryConditionNotMetError(
            'Retry condition not met: ' + message
          )
        }

        let delay: number
        if (typeof retry.delay === 'number') {
          delay = retry.delay
        } else {
          delay = retry.delay(retry.count)
        }
        // console.debug('Error, retrying in', delay, 'ms.\nError:', error)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    const textResponse = await response.text()
    const responseCopy = {
      ...response,
      json: () => null,
      text: () => textResponse,
    } as GoodiesResponse<JSONType>

    if (
      forceParseJson ||
      response.headers.get('Content-Type')?.includes('application/json')
    ) {
      const jsonResponse: JSONType = JSON.parse(textResponse)
      responseCopy.json = () => jsonResponse
    }

    return responseCopy
  }

  Object.assign(fetchWithGoodies, {
    get: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'GET', body: undefined }),
    post: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'POST' }),
    head: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'HEAD', body: undefined }),
    put: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'PUT' }),
    delete: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'DELETE' }),
    connect: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, {
        ...options,
        method: 'CONNECT',
        body: undefined,
      }),
    options: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, {
        ...options,
        method: 'OPTIONS',
        body: undefined,
      }),
    trace: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'TRACE', body: undefined }),
    patch: (input: GoodiesInput, options: GoodiesRequestOptions = {}) =>
      fetchWithGoodies(input, { ...options, method: 'PATCH', body: undefined }),
  })

  type FetchWithGoodies<T> = typeof fetchWithGoodies<T>

  return fetchWithGoodies as (<T>(
    input: GoodiesInput,
    options?: GoodiesRequestOptions
  ) => ReturnType<FetchWithGoodies<T>>) & {
    get: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    head: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    post: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    put: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    delete: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    connect: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    options: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    trace: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
    patch: <T>(
      input: GoodiesInput,
      options?: Omit<GoodiesRequestOptions, 'method'>
    ) => ReturnType<FetchWithGoodies<T>>
  }
}
