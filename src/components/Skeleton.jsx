export default function Skeleton({ className = "", style }) {
  return <div className={`skeleton-shimmer rounded-lg bg-cream-200 ${className}`} style={style} aria-hidden="true" />;
}
