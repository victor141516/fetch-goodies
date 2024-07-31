export type GoodiesInput = string | URL | Request;
export type RetryParameters = {
    on?: (params: {
        error: unknown;
        response: Response | null;
        retryCount: number;
    }) => boolean;
    delay?: number | ((attemp: number) => number);
    count?: number;
};
export type RetryOptions = boolean | number | RetryParameters;
export type HttpVerbs = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH' | 'UPDATE';
type VerbsWithBody = Extract<HttpVerbs, 'POST' | 'PUT' | 'DELETE' | 'UPDATE'>;
type VerbsWithoutBody = Exclude<HttpVerbs, VerbsWithBody>;
type MethodBodyCombination = {
    method?: VerbsWithBody;
    body?: string | ReadableStream | FormData;
    json?: never;
} | {
    method?: VerbsWithBody;
    body?: never;
    json?: any;
} | {
    method?: VerbsWithoutBody;
    body?: never;
    json?: never;
};
export type HTTPHeaders = 'Accept' | 'Accept-CH' | 'Accept-Charset' | 'Accept-Encoding' | 'Accept-Language' | 'Accept-Patch' | 'Accept-Post' | 'Accept-Ranges' | 'Access-Control-Allow-Credentials' | 'Access-Control-Allow-Headers' | 'Access-Control-Allow-Methods' | 'Access-Control-Allow-Origin' | 'Access-Control-Expose-Headers' | 'Access-Control-Max-Age' | 'Access-Control-Request-Headers' | 'Access-Control-Request-Method' | 'Age' | 'Allow' | 'Alt-Svc' | 'Alt-Used' | 'Attribution-Reporting-EligibleExperimental' | 'Attribution-Reporting-Register-SourceExperimental' | 'Attribution-Reporting-Register-TriggerExperimental' | 'Authorization' | 'Cache-Control' | 'Clear-Site-Data' | 'Connection' | 'Content-DigestExperimental' | 'Content-Disposition' | 'Content-DPRNon-standardDeprecated' | 'Content-Encoding' | 'Content-Language' | 'Content-Length' | 'Content-Location' | 'Content-Range' | 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only' | 'Cookie' | 'Critical-CHExperimental' | 'Cross-Origin-Embedder-Policy' | 'Cross-Origin-Opener-Policy' | 'Cross-Origin-Resource-Policy' | 'Date' | 'Device-Memory' | 'DigestNon-standardDeprecated' | 'DNTNon-standardDeprecated' | 'DownlinkExperimental' | 'DPRNon-standardDeprecated' | 'Early-DataExperimental' | 'ECTExperimental' | 'ETag' | 'Expect' | 'Expect-CT' | 'Expires' | 'Forwarded' | 'From' | 'Host' | 'If-Match' | 'If-Modified-Since' | 'If-None-Match' | 'If-Range' | 'If-Unmodified-Since' | 'Keep-Alive' | 'Last-Modified' | 'Link' | 'Location' | 'Max-Forwards' | 'NELExperimental' | 'No-Vary-SearchExperimental' | 'Observe-Browsing-TopicsExperimentalNon-standard' | 'Origin' | 'Origin-Agent-ClusterExperimental' | 'Permissions-Policy' | 'PragmaDeprecated' | 'Priority' | 'Proxy-Authenticate' | 'Proxy-Authorization' | 'Range' | 'Referer' | 'Referrer-Policy' | 'Reporting-Endpoints' | 'Repr-DigestExperimental' | 'Retry-After' | 'RTTExperimental' | 'Save-DataExperimental' | 'Sec-Browsing-TopicsExperimentalNon-standard' | 'Sec-CH-Prefers-Color-SchemeExperimental' | 'Sec-CH-Prefers-Reduced-MotionExperimental' | 'Sec-CH-Prefers-Reduced-TransparencyExperimental' | 'Sec-CH-UAExperimental' | 'Sec-CH-UA-ArchExperimental' | 'Sec-CH-UA-BitnessExperimental' | 'Sec-CH-UA-Full-VersionDeprecated' | 'Sec-CH-UA-Full-Version-ListExperimental' | 'Sec-CH-UA-MobileExperimental' | 'Sec-CH-UA-ModelExperimental' | 'Sec-CH-UA-PlatformExperimental' | 'Sec-CH-UA-Platform-VersionExperimental' | 'Sec-Fetch-Dest' | 'Sec-Fetch-Mode' | 'Sec-Fetch-Site' | 'Sec-Fetch-User' | 'Sec-GPCExperimentalNon-standard' | 'Sec-Purpose' | 'Sec-WebSocket-Accept' | 'Server' | 'Server-Timing' | 'Service-Worker-Navigation-Preload' | 'Set-Cookie' | 'Set-LoginExperimental' | 'SourceMap' | 'Speculation-RulesExperimental' | 'Strict-Transport-Security' | 'Supports-Loading-ModeExperimental' | 'TE' | 'Timing-Allow-Origin' | 'TkNon-standardDeprecated' | 'Trailer' | 'Transfer-Encoding' | 'Upgrade' | 'Upgrade-Insecure-Requests' | 'User-Agent' | 'Vary' | 'Via' | 'Viewport-WidthNon-standardDeprecated' | 'Want-Content-DigestExperimental' | 'Want-DigestNon-standardDeprecated' | 'Want-Repr-DigestExperimental' | 'WarningDeprecated' | 'WidthNon-standardDeprecated' | 'WWW-Authenticate' | 'X-Content-Type-Options' | 'X-DNS-Prefetch-ControlNon-standard' | 'X-Forwarded-ForNon-standard' | 'X-Forwarded-HostNon-standard' | 'X-Forwarded-ProtoNon-standard' | 'X-Frame-Options' | 'X-XSS-ProtectionNon-standard';
type MimeTypes = '.jpg' | '.midi' | 'XML' | 'application/epub+zip' | 'application/gzip' | 'application/java-archive' | 'application/json' | 'application/ld+json' | 'application/msword' | 'application/octet-stream' | 'application/ogg' | 'application/pdf' | 'application/php' | 'application/rtf' | 'application/vnd.amazon.ebook' | 'application/vnd.apple.installer+xml' | 'application/vnd.mozilla.xul+xml' | 'application/vnd.ms-excel' | 'application/vnd.ms-fontobject' | 'application/vnd.ms-powerpoint' | 'application/vnd.oasis.opendocument.presentation' | 'application/vnd.oasis.opendocument.spreadsheet' | 'application/vnd.oasis.opendocument.text' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/vnd.rar' | 'application/vnd.visio' | 'application/x-abiword' | 'application/x-bzip' | 'application/x-bzip2' | 'application/x-csh' | 'application/x-freearc' | 'application/x-sh' | 'application/x-shockwave-flash' | 'application/x-tar' | 'application/x-7z-compressed' | 'application/xhtml+xml' | 'application/zip' | 'audio/aac' | 'audio/mpeg' | 'audio/ogg' | 'audio/opus' | 'audio/wav' | 'audio/webm' | 'font/otf' | 'font/ttf' | 'font/woff' | 'font/woff2' | 'image/bmp' | 'image/gif' | 'image/png' | 'image/svg+xml' | 'image/tiff' | 'image/vnd.microsoft.icon' | 'image/webp' | 'text/calendar' | 'text/css' | 'text/csv' | 'text/html' | 'text/javascript' | 'text/plain' | 'video/3gpp' | 'video/3gpp2' | 'video/mp2t' | 'video/mpeg' | 'video/ogg' | 'video/webm' | 'video/x-msvideo';
export type GoodiesRequestOptions = RequestInit & FetchRequestInit & MethodBodyCombination & {
    json?: unknown;
    retry?: RetryOptions;
    headers?: Record<string, string> | ({
        'Content-Type'?: MimeTypes;
    } & {
        [key in HTTPHeaders]: string;
    });
};
export type GoodiesOptions = {
    urlPrefix?: string;
    httpCodesConsideredSuccessful?: number[] | ((statusCode: number) => boolean);
    retry?: {
        count?: number;
        delay?: number;
    };
    forceParseJson?: boolean;
};
export type GoodiesResponse<JSONType = any> = Omit<Response, 'json' | 'text'> & {
    json: () => JSONType | null;
} & {
    text: () => string;
};
export {};
