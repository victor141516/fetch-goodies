export class GoodiesError extends Error {}
export class FetchGoodiesError extends GoodiesError {}
export class NoMoreRetriesError extends GoodiesError {}
export class RetryConditionNotMetError extends GoodiesError {}
export class HttpStatusCodeConsideredError extends GoodiesError {}
export class UrlPrefixNotSupportedError extends GoodiesError {}
