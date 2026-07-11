const variants = {
  primary:
    "bg-terracotta-500 text-cream-50 hover:bg-terracotta-600 disabled:bg-terracotta-300",
  secondary:
    "bg-olive-500 text-cream-50 hover:bg-olive-600 disabled:bg-olive-300",
  outline:
    "border-2 border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50 disabled:opacity-40",
  ghost: "text-charcoal-700 hover:bg-cream-200 disabled:opacity-40",
  danger: "bg-danger-500 text-cream-50 hover:bg-danger-600 disabled:bg-danger-500/40",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
