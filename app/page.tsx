// Root / — middleware redirects to /fr
// This page is never served in normal operation.
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/fr')
}
