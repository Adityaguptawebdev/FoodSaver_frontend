import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold text-charcoal-900">404</h1>
      <p className="mt-2 text-charcoal-700">This page doesn't exist, or the food's already been claimed.</p>
      <Button as={Link} to="/" variant="primary" className="mt-6">Back home</Button>
    </div>
  );
}
