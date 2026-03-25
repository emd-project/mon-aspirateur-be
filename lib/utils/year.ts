/**
 * Returns the current year for server-side rendering.
 * Use in generateMetadata() and server components only.
 * Never in useState / useEffect.
 */
export const currentYear = (): number => new Date().getFullYear()
