const googleScriptUrl = "https://accounts.google.com/gsi/client";
let googleLibraryPromise;

export function getGoogleClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend/.env.");
  }

  return clientId;
}

export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleLibraryPromise) {
    return googleLibraryPromise;
  }

  googleLibraryPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-identity="true"]');
    const script = existingScript || document.createElement("script");

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        reject(new Error("Google sign-in did not load correctly."));
      }
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load Google sign-in.")), {
      once: true,
    });

    if (!existingScript) {
      script.src = googleScriptUrl;
      script.async = true;
      script.dataset.googleIdentity = "true";
      document.head.appendChild(script);
    }
  });

  return googleLibraryPromise;
}
