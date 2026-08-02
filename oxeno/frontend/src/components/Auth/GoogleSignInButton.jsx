import { useEffect, useRef, useState } from "react";
import {
  getGoogleClientId,
  loadGoogleIdentity,
} from "../../services/googleIdentity.js";

export default function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let disposed = false;

    async function renderGoogleButton() {
      try {
        const google = await loadGoogleIdentity();
        if (disposed || !buttonRef.current) return;

        google.accounts.id.initialize({
          client_id: getGoogleClientId(),
          callback: (response) => {
            if (!response.credential) {
              onError(
                "Google did not return a sign-in credential. Please try again.",
              );
              return;
            }
            void onCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.replaceChildren();
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 400,
        });
      } catch (error) {
        if (!disposed) {
          setLoadError(error.message || "Unable to load Google sign-in.");
        }
      }
    }

    renderGoogleButton();

    return () => {
      disposed = true;
      buttonRef.current?.replaceChildren();
    };
  }, [onCredential, onError]);

  if (loadError) {
    return <p className="login__form-error">{loadError}</p>;
  }

  return (
    <div
      ref={buttonRef}
      className="login__google-button"
      aria-label="Continue with Google"
    />
  );
}
