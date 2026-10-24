import { GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders nothing when VITE_GOOGLE_CLIENT_ID isn't set, so the app still works without it.
export default function GoogleSignInButton({ onCredential, onError }) {
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-charcoal-700">
        <span className="h-px flex-1 bg-charcoal-900/10" aria-hidden="true" />
        or
        <span className="h-px flex-1 bg-charcoal-900/10" aria-hidden="true" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(res) => onCredential(res.credential)}
          onError={onError}
          text="continue_with"
          shape="pill"
        />
      </div>
    </div>
  );
}
