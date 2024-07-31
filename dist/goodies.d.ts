import type { GoodiesRequestOptions, GoodiesInput, GoodiesOptions, GoodiesResponse } from './types';
export declare const goodies: (fetchFunction: typeof fetch, { urlPrefix, httpCodesConsideredSuccessful, retry: { count, delay }, forceParseJson, }?: GoodiesOptions) => (<T>(input: GoodiesInput, options?: GoodiesRequestOptions) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>) & {
    get: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    head: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    post: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    put: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    delete: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    connect: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    options: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    trace: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
    patch: <T>(input: GoodiesInput, options?: Omit<GoodiesRequestOptions, "method">) => ReturnType<(input: GoodiesInput, options?: GoodiesRequestOptions) => Promise<GoodiesResponse<T>>>;
};
