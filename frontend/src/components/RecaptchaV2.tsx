import { useEffect, useRef, useState } from 'react';

export const RECAPTCHA_SITE_KEY = '6Ldu9dstAAAAAEssV2f88pzpXf_rc7zX3O9MOgWy';

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
      } catch {
        setError('No fue posible cargar reCAPTCHA. Recarga la página e inténtalo nuevamente.');
      }
    };

    window.onSerenaRecaptchaReady = renderWidget;
    if (window.grecaptcha) {
      renderWidget();
    } else {
      let script = document.getElementById('serena-recaptcha-script') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'serena-recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onSerenaRecaptchaReady&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('error', () => setError('No fue posible cargar reCAPTCHA. Verifica tu conexión.'));
      script.addEventListener('load', renderWidget);
    }

    return () => {
      active = false;
      if (widgetIdRef.current !== null) window.grecaptcha?.reset(widgetIdRef.current);
      widgetIdRef.current = null;
      window.onSerenaRecaptchaReady = undefined;
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
