import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface RecaptchaV3Handle {
  execute: (action: string) => Promise<string>;
}

interface RecaptchaApi {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const scriptId = 'serena-recaptcha-v3-script';
let apiPromise: Promise<RecaptchaApi> | null = null;

function loadRecaptchaApi(): Promise<RecaptchaApi> {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<RecaptchaApi>((resolve, reject) => {
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    const script = existingScript || document.createElement('script');
    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
    const handleLoad = () => {
      cleanup();
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error('La API de reCAPTCHA no está disponible.'));
    };
    const handleError = () => {
      cleanup();
      script.remove();
      reject(new Error('No se pudo cargar reCAPTCHA.'));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    if (!existingScript) {
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    apiPromise = null;
    throw error;
  });

  return apiPromise;
}

export const RecaptchaV3 = forwardRef<RecaptchaV3Handle, object>(function RecaptchaV3(_props, ref) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!siteKey) {
      setError('Configura una clave pública reCAPTCHA v3 válida para este dominio.');
      return;
    }

    let active = true;
    void loadRecaptchaApi().catch(() => {
      if (active) setError('No se pudo cargar reCAPTCHA. Verifica la clave y el dominio autorizado.');
    });
    return () => { active = false; };
  }, []);

  useImperativeHandle(ref, () => ({
    execute: async (action) => {
      if (!siteKey) {
        const message = 'Configura una clave pública reCAPTCHA v3 válida para este dominio.';
        setError(message);
        throw new Error(message);
      }

      setError('');
      try {
        const api = await loadRecaptchaApi();
        const token = await new Promise<string>((resolve, reject) => {
          api.ready(() => {
            void api.execute(siteKey, { action }).then(resolve, reject);
          });
        });
        if (!token) throw new Error('Google no generó un token de verificación.');
        return token;
      } catch {
        const message = 'No fue posible generar el token reCAPTCHA. Verifica la conexión y la clave configurada.';
        setError(message);
        throw new Error(message);
      }
    },
  }), []);

  return <div aria-live="polite">{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>;
});