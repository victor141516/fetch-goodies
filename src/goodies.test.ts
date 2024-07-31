import { describe, vi, expect, beforeAll, it } from 'vitest'
import { goodies } from './goodies'
import {
  HttpStatusCodeConsideredError,
  NoMoreRetriesError,
  RetryConditionNotMetError,
  UrlPrefixNotSupportedError,
} from './errors'

const nextTickPromiseSymbol = Symbol('nextTickPromise')
const nextTickPromise = () =>
  new Promise((res) => setTimeout(res, 0)).then(() => nextTickPromiseSymbol)

describe('goodies', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  it('should call fetch with the correct url', async () => {
    const fetchMock = vi.fn().mockReturnValue(Promise.resolve(new Response()))
    const f = goodies(fetchMock)
    await f('https://example.com')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object)
    )
  })

  describe('initial configuration', () => {
    describe('urlPrefix', () => {
      it('should work for string inputs', async () => {
        const fetchMock = vi
          .fn()
          .mockReturnValue(Promise.resolve(new Response()))
        const f = goodies(fetchMock, { urlPrefix: 'https://example.com' })
        await f('/a/b/c')
        expect(fetchMock).toHaveBeenCalledWith(
          'https://example.com/a/b/c',
          expect.any(Object)
        )
      })

      it('should not work for object inputs', async () => {
        const fetchMock = vi
          .fn()
          .mockReturnValue(Promise.resolve(new Response()))
        const f = goodies(fetchMock, { urlPrefix: 'https://example.com' })
        const input = new URL('/a/b/c', 'https://example.com')
        expect(() => f(input)).rejects.toThrowError(UrlPrefixNotSupportedError)
      })
    })

    describe('httpCodesConsideredSuccessful', () => {
      describe('and the status codes is used in the function syntax', () => {
        describe('and the function returns true', () => {
          it('should consider the status code as success', async () => {
            const fetchMock = vi
              .fn()
              .mockReturnValue(
                Promise.resolve(new Response('', { status: 200 }))
              )
            const f = goodies(fetchMock, {
              httpCodesConsideredSuccessful: () => true,
            })
            await f('https://example.com')
            expect(fetchMock).toHaveBeenCalledWith(
              'https://example.com',
              expect.any(Object)
            )
          })
        })

        describe('and the function returns false', () => {
          it('should consider the status code as error', async () => {
            const fetchMock = vi
              .fn()
              .mockReturnValue(
                Promise.resolve(new Response('', { status: 400 }))
              )
            const f = goodies(fetchMock, {
              httpCodesConsideredSuccessful: () => false,
            })
            vi.runAllTimersAsync()
            expect(() => f('https://example.com')).rejects.toThrowError(
              NoMoreRetriesError
            )
          })
        })
      })

      describe('and the status codes is used in the array syntax', () => {
        describe('and the status code is in the array', () => {
          it('should consider the status code as success', async () => {
            const fetchMock = vi
              .fn()
              .mockReturnValue(
                Promise.resolve(new Response('', { status: 200 }))
              )
            const f = goodies(fetchMock, {
              httpCodesConsideredSuccessful: [200],
            })
            await f('https://example.com')
            expect(fetchMock).toHaveBeenCalledWith(
              'https://example.com',
              expect.any(Object)
            )
          })
        })

        describe('and the status code is not in the array', () => {
          it('should consider the status code as error', async () => {
            const fetchMock = vi
              .fn()
              .mockReturnValue(
                Promise.resolve(new Response('', { status: 400 }))
              )
            const f = goodies(fetchMock, {
              httpCodesConsideredSuccessful: [200],
            })
            vi.runAllTimersAsync()
            expect(() => f('https://example.com')).rejects.toThrowError(
              NoMoreRetriesError
            )
          })
        })
      })
    })
  })

  describe('when input data has json', () => {
    it('should call fetch with the correct body and headers', async () => {
      const fetchMock = vi.fn().mockReturnValue(Promise.resolve(new Response()))
      const f = goodies(fetchMock)
      await f('https://example.com', { json: { key: 'value' } })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should respect the other headers', async () => {
      const fetchMock = vi.fn().mockReturnValue(Promise.resolve(new Response()))
      const f = goodies(fetchMock)
      await f('https://example.com', {
        json: { key: 'value' },
        headers: { 'X-Custom-Header': 'custom-value' },
      })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' }),
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          },
        })
      )
    })
  })

  describe('retry', () => {
    it('should retry by default', async () => {
      let counter = 2
      const fetchMock = vi.fn().mockImplementation((url) => {
        counter--
        if (counter === 0) return Promise.resolve(new Response())
        return Promise.reject(new Error('Failed to fetch'))
      })
      const f = goodies(fetchMock)
      vi.runAllTimersAsync()
      await f('https://example.com')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    describe('after retry limit', () => {
      it('should throw', async () => {
        const fetchMock = vi
          .fn()
          .mockRejectedValue(new Error('Failed to fetch'))
        const f = goodies(fetchMock)
        vi.runAllTimersAsync()
        await expect(() => f('https://example.com')).rejects.toThrowError(
          NoMoreRetriesError
        )
      })
    })

    describe('when retry is disabled', () => {
      it('should not retry', async () => {
        const fetchMock = vi
          .fn()
          .mockRejectedValue(new Error('Failed to fetch'))
        const f = goodies(fetchMock)
        vi.runAllTimersAsync()
        await expect(() =>
          f('https://example.com', { retry: false })
        ).rejects.toThrowError(NoMoreRetriesError)
      })
    })

    describe('when an specific amount of retries is given', () => {
      describe('using the number syntax', () => {
        it('should retry the specified amount of times', async () => {
          const fetchMock = vi
            .fn()
            .mockRejectedValue(new Error('Failed to fetch'))
          const f = goodies(fetchMock)
          vi.runAllTimersAsync()
          await expect(() =>
            f('https://example.com', { retry: 15 })
          ).rejects.toThrowError(NoMoreRetriesError)
          expect(fetchMock).toHaveBeenCalledTimes(15)
        })
      })

      describe('using the object syntax', () => {
        it('should retry the specified amount of times', async () => {
          const fetchMock = vi
            .fn()
            .mockRejectedValue(new Error('Failed to fetch'))
          const f = goodies(fetchMock)
          vi.runAllTimersAsync()
          await expect(() =>
            f('https://example.com', { retry: { count: 15 } })
          ).rejects.toThrowError(NoMoreRetriesError)
          expect(fetchMock).toHaveBeenCalledTimes(15)
        })
      })
    })

    describe('when a delay is given', () => {
      describe('using the number syntax', () => {
        it('should retry after the specified delay', async () => {
          const fetchMock = vi
            .fn()
            .mockRejectedValue(new Error('Failed to fetch'))
          const f = goodies(fetchMock)
          vi.advanceTimersByTimeAsync(8_000)
          const result = f('https://example.com', { retry: { delay: 10_000 } })
          await expect(Promise.race([result, nextTickPromise()])).resolves.toBe(
            nextTickPromiseSymbol
          )
          vi.advanceTimersByTimeAsync(3_000)
          await expect(() => result).rejects.toThrowError(NoMoreRetriesError)
        })
      })

      describe('using the function syntax', () => {
        it('should retry using the function result', async () => {
          const fetchMock = vi
            .fn()
            .mockRejectedValue(new Error('Failed to fetch'))
          const f = goodies(fetchMock)
          vi.advanceTimersByTimeAsync(8_000)
          const result = f('https://example.com', {
            retry: { count: 10, delay: (attempt) => attempt * 1_000 },
          })
          await expect(Promise.race([result, nextTickPromise()])).resolves.toBe(
            nextTickPromiseSymbol
          )
          vi.advanceTimersByTimeAsync(3_000)
          await expect(() => result).rejects.toThrowError(NoMoreRetriesError)
        })
      })
    })

    describe('when a retry condition is given', () => {
      it('should retry if the condition is met', async () => {
        const fetchMock = vi
          .fn()
          .mockRejectedValue(new Error('Failed to fetch'))
        const f = goodies(fetchMock)
        vi.runAllTimersAsync()
        await expect(() =>
          f('https://example.com', { retry: { count: 10, on: () => true } })
        ).rejects.toThrowError(NoMoreRetriesError)
        expect(fetchMock).toHaveBeenCalledTimes(10)
      })

      it('should not retry if the condition is not met', async () => {
        const fetchMock = vi
          .fn()
          .mockRejectedValue(new Error('Failed to fetch'))
        const f = goodies(fetchMock)
        vi.runAllTimersAsync()
        await expect(() =>
          f('https://example.com', { retry: { on: () => false } })
        ).rejects.toThrowError(RetryConditionNotMetError)
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the fetch function throws a weird error', () => {
      it('should throw gracefully', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Date())
        const f = goodies(fetchMock)
        vi.runAllTimersAsync()
        await expect(() =>
          f('https://example.com')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: No more retries: Unknown error]`
        )
      })
    })
  })

  describe('response', () => {
    describe('text', () => {
      it('should return text without promise', async () => {
        const fetchMock = vi
          .fn()
          .mockReturnValue(Promise.resolve(new Response('text')))
        const f = goodies(fetchMock)
        const result = await f('https://example.com')
        expect(result.text()).toBe('text')
      })

      describe('when the response is looks like json', () => {
        it('should not return json', async () => {
          const fetchMock = vi
            .fn()
            .mockReturnValue(
              Promise.resolve(new Response(JSON.stringify({ key: 'value' })))
            )
          const f = goodies(fetchMock)
          const result = await f('https://example.com')
          expect(result.json()).toEqual(null)
          expect(result.text()).toBe('{"key":"value"}')
        })
      })

      it('should return json without promise', async () => {
        const fetchMock = vi
          .fn()
          .mockReturnValue(
            Promise.resolve(new Response(JSON.stringify('text')))
          )
        const f = goodies(fetchMock)
        const result = await f('https://example.com')
        expect(result.json()).toBe(null)
      })
    })

    describe('json', () => {
      it('should return json without promise', async () => {
        const fetchMock = vi.fn().mockReturnValue(
          Promise.resolve(
            new Response(JSON.stringify({ key: 'value' }), {
              headers: {
                'Content-Type': 'application/json',
              },
            })
          )
        )
        const f = goodies(fetchMock)
        const result = await f('https://example.com')
        expect(result.text()).toBe('{"key":"value"}')
      })

      describe('and forceParseJson is true', () => {
        describe('and the response is doesnt have a content-type header', () => {
          it('should return json without promise', async () => {
            const fetchMock = vi
              .fn()
              .mockReturnValue(
                Promise.resolve(new Response(JSON.stringify({ key: 'value' })))
              )
            vi.advanceTimersByTimeAsync(3_000)
            const f = goodies(fetchMock, { forceParseJson: true })
            const result = await f('https://example.com')
            expect(result.json()).toEqual({ key: 'value' })
          })
        })
      })
    })
  })

  describe('side functions', () => {
    const verbs = [
      'get',
      'post',
      'head',
      'put',
      'delete',
      'connect',
      'options',
      'trace',
      'patch',
    ] as const

    for (const verb of verbs) {
      describe(verb, () => {
        it(`should perform a ${verb.toLocaleUpperCase()} request`, async () => {
          const fetchMock = vi
            .fn()
            .mockReturnValue(Promise.resolve(new Response()))
          const f = goodies(fetchMock)
          await f[verb]('https://example.com')
          expect(fetchMock).toHaveBeenCalledWith(
            'https://example.com',
            expect.objectContaining({
              method: verb.toLocaleUpperCase(),
            })
          )
        })
      })
    }
  })
})
