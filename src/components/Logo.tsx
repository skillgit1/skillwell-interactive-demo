/**
 * Skillwell logo — official horizontal wordmark (Ocean Green #004853),
 * from /public/skillwell-logo-horizontal.svg. To swap variants, replace
 * that file (or point the src elsewhere).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}skillwell-logo-horizontal.svg`}
      alt="Skillwell"
      className={`h-5 w-auto ${className ?? ''}`}
    />
  )
}
