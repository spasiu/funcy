// Funcy Fetch Library - Wrapper around JavaScript fetch API

interface FetchOptions {
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

async function fetchRequest(
  url: string,
  method: string,
  options: FetchOptions = {}
): Promise<any> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Fetch error: ${error.message}`);
  }
}

export const Fetch = {
  get(url: string, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'GET', options);
  },

  post(url: string, body: any, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'POST', { ...options, body });
  },

  put(url: string, body: any, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'PUT', { ...options, body });
  },

  delete(url: string, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'DELETE', options);
  },

  patch(url: string, body: any, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'PATCH', { ...options, body });
  },

  head(url: string, options: FetchOptions = {}): Promise<any> {
    return fetchRequest(url, 'HEAD', options);
  },
};
