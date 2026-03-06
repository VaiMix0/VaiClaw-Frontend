export interface Params {
  baseUrl: string;
  beforeRequest?: (url: string, options: RequestInit) => Promise<RequestInit>;
  afterRequest?: (
    url: string,
    options: RequestInit,
    response: Response
  ) => Promise<boolean>;
}
export const customFetch = (
  params: Params,
  auth?: string,
  showorg?: string,
  secured: boolean = true
) => {
  return async function newFetch(url: string, options: RequestInit = {}) {
    const loggedAuth =
      typeof window === 'undefined'
        ? undefined
        : new URL(window.location.href).searchParams.get('loggedAuth');
    const newRequestObject = await params?.beforeRequest?.(url, options);
    const authNonSecuredCookie =
      typeof document === 'undefined'
        ? null
        : (() => {
          const part = document.cookie
            .split(';')
            .find((p) => p.trim().startsWith('auth='));
          return part ? part.trim().slice('auth='.length) : null;
        })();

    if (typeof window !== 'undefined' && url.includes('/user/self')) {
      console.log("[customFetch DEBUG] url:", url);
      console.log("[customFetch DEBUG] document.cookie:", typeof document !== 'undefined' ? document.cookie : 'no-document');
      console.log("[customFetch DEBUG] authNonSecuredCookie parsed:", authNonSecuredCookie);
      console.log("[customFetch DEBUG] isSecured flag:", secured);
    }

    const authNonSecuredOrg =
      typeof document === 'undefined'
        ? null
        : document.cookie
          .split(';')
          .find((p) => p.includes('showorg='))
          ?.split('=')[1];

    const authNonSecuredImpersonate =
      typeof document === 'undefined'
        ? null
        : document.cookie
          .split(';')
          .find((p) => p.includes('impersonate='))
          ?.split('=')[1];

    const fetchRequest = await fetch(params.baseUrl + url, {
      ...(secured ? { credentials: 'include' } : {}),
      ...(newRequestObject || options),
      headers: {
        ...(showorg
          ? { showorg }
          : authNonSecuredOrg
            ? { showorg: authNonSecuredOrg }
            : {}),
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...(loggedAuth ? { auth: loggedAuth } : {}),
        ...options?.headers,
        ...(auth
          ? { Authorization: `Bearer ${auth}` }
          : authNonSecuredCookie
            ? { Authorization: `Bearer ${authNonSecuredCookie}` }
            : {}),
        ...(authNonSecuredImpersonate
          ? { impersonate: authNonSecuredImpersonate }
          : {}),
      },
      // @ts-ignore
      ...(!options.next && options.cache !== 'force-cache'
        ? { cache: options.cache || 'no-store' }
        : {}),
    });

    if (
      !params?.afterRequest ||
      (await params?.afterRequest?.(url, options, fetchRequest))
    ) {
      return fetchRequest;
    }

    // @ts-ignore
    return new Promise((res) => { }) as Response;
  };
};

export const fetchBackend = customFetch({
  get baseUrl() {
    return process.env.BACKEND_URL!;
  },
});
