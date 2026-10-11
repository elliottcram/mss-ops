import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/public-sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'MSS Operations',
  description: 'Jobs through the MSS umbrella scheme, from enquiry to handover.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#17262C' }

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
