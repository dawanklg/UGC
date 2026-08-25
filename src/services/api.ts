// API Key Management and Request Helper Service

const STORAGE_KEY = 'CUSTOM_GEMINI_API_KEY';

type ApiKeyErrorListener = (errorMessage?: string) => void;
const apiKeyErrorListeners: Set<ApiKeyErrorListener> = new Set();

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage:', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove API key from localStorage:', e);
  }
}

export function subscribeApiKeyError(listener: ApiKeyErrorListener): () => void {
  apiKeyErrorListeners.add(listener);
  return () => {
    apiKeyErrorListeners.delete(listener);
  };
}

export function notifyApiKeyError(errorMsg?: string) {
  apiKeyErrorListeners.forEach((listener) => listener(errorMsg));
}

// Function to test and verify a Gemini API key
export async function verifyApiKey(apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/verify-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
      },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'API Key valid & dapat digunakan!' };
    } else {
      return {
        success: false,
        error: data.error || 'API Key tidak valid atau gagal terhubung ke Gemini API.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan jaringan saat memverifikasi API Key.',
    };
  }
}

// Wrapper for fetch that injects the x-api-key header and catches 401/API key errors
export async function fetchWithApiKey(url: string, options: RequestInit = {}): Promise<Response> {
  const customKey = getStoredApiKey();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (customKey) {
    headers.set('x-api-key', customKey);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const clone = response.clone();
      try {
        const errorData = await clone.json();
        if (errorData.isApiKeyError) {
          notifyApiKeyError(errorData.error);
        }
      } catch {
        notifyApiKeyError('Masalah otentikasi API Key terdeteksi.');
      }
    }

    return response;
  } catch (err: any) {
    throw err;
  }
}
