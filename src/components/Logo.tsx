/**
 * Skillwell logo — official brand asset pulled from skillwell.com
 * (/public/skillwell-logo.png). To swap for another variant (e.g. a
 * horizontal lockup), replace the file in /public.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/skillwell-logo.png"
      alt="Skillwell"
      className={`h-12 w-auto ${className ?? ''}`}
    />
  )
}
