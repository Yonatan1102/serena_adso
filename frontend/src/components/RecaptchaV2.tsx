import { useEffect, useRef, useState } from 'react';

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Ldu9dstAAAAAEssV2f88pzpXf_rc7zX3O9MOgWy';

interface RecaptchaApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ) => number;
  reset: (widgetId?: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    onSerenaRecaptchaReady?: () => void;
  }
}

interface RecaptchaV2Props {
  onToken: (token: string) => void;
}

export function RecaptchaV2({ onToken }: RecaptchaV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let script: HTMLScriptElement | null = null;
    let loadTimeout = 0;

    const renderWidget = () => {
      if (!active || !containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;
      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => {
            onToken('');
            setError('No fue posible validar reCAPTCHA. Verifica tu conexión y vuelve a intentarlo.');
          },
        });
        setError('');
        window.clearTimeout(loadTimeout);
      } catch {
        setError('No fue posible mostrar reCAPTCHA. Comprueba que el dominio esté autorizado para esta clave.');
      }
    };

    const handleScriptError = () => {
      if (active) setError('No fue posible cargar reCAPTCHA. Verifica la conexión con Google.');
    };

    window.onSerenaRecaptchaReady = renderWidget;
    if (window.grecaptcha) {
      renderWidget();
    } else {
      script = document.getElementById('serena-recaptcha-script') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'serena-recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onSerenaRecaptchaReady&render=explicit';
        script.async = true;
        script.defer = true;
      }
      script.addEventListener('error', handleScriptError);
      script.addEventListener('load', renderWidget);
      if (!script.isConnected) document.head.appendChild(script);
      loadTimeout = window.setTimeout(() => {
        if (active && !window.grecaptcha) handleScriptError();
      }, 15000);
    }

    return () => {
      active = false;
      window.clearTimeout(loadTimeout);
      script?.removeEventListener('error', handleScriptError);
      script?.removeEventListener('load', renderWidget);
      if (widgetIdRef.current !== null) window.grecaptcha?.reset(widgetIdRef.current);
      widgetIdRef.current = null;
      if (window.onSerenaRecaptchaReady === renderWidget) window.onSerenaRecaptchaReady = undefined;
      containerRef.current?.replaceChildren();
      onToken('');
    };
  }, [onToken]);

  return (
    <div>
      <div ref={containerRef} aria-label="Verificación reCAPTCHA" />
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
