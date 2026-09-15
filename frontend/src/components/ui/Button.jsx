const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  const baseStyles =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover disabled:bg-primary-light disabled:text-text-muted",

    secondary:
      "border border-border bg-primary-light text-primary hover:bg-primary-soft",

    accent: "bg-accent text-white hover:bg-accent-hover",

    dark: "bg-sidebar text-white hover:bg-dark",

    danger: "border border-error bg-error-bg text-error hover:bg-error",

    ghost:
      "bg-transparent text-text-secondary hover:bg-primary-light hover:text-primary",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
