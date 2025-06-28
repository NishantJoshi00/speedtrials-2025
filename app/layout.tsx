import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import 'leaflet/dist/leaflet.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
}

export const metadata: Metadata = {
  title: 'Georgia Water Safety Dashboard',
  description: 'Know what\'s in your drinking water. Access real-time water quality information for public water systems across Georgia.',
  keywords: ['Georgia', 'water quality', 'drinking water', 'public health', 'SDWA', 'water safety'],
  authors: [{ name: 'Georgia Environmental Protection Division' }],
  metadataBase: new URL('https://georgia-water-dashboard.vercel.app'),
  openGraph: {
    title: 'Georgia Water Safety Dashboard',
    description: 'Know what\'s in your drinking water. Access real-time water quality information for public water systems across Georgia.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Accessibility and mobile optimization
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'GA Water Safety',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} bg-brand-cream-100 text-gray-900 antialiased`}>
        {/* Skip to main content for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white px-4 py-2 rounded-md shadow-lg focus-visible"
        >
          Skip to main content
        </a>
        
        {/* Main layout */}
        <div className="min-h-screen flex flex-col">
          {/* Header - Simplified */}
          <header className="bg-white border-b border-brand-cream-200">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-between h-12">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Image src="/logo.png" alt="Georgia Water Logo" width={24} height={24} className="object-contain" />
                  </div>
                  <div>
                    <h1 className="text-base font-medium text-gray-700">
                      <a href="/" className="hover:text-gray-900 transition-colors">
                        Georgia Water
                      </a>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <nav className="hidden sm:flex items-center space-x-6">
                    <a 
                      href="/" 
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Home
                    </a>
                    <a 
                      href="/map" 
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Map
                    </a>
                    <a 
                      href="/ai" 
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      AI Assistant
                    </a>
                  </nav>
                  <a 
                    href="tel:404-656-4713" 
                    className="text-xs font-medium text-red-600 hover:text-red-700 focus-visible hidden sm:block"
                  >
                    Emergency: (404) 656-4713
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main id="main-content" className="flex-1">
            {children}
          </main>

          {/* Footer - Simplified */}
          <footer className="bg-white border-t border-brand-cream-200">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Data from Georgia Environmental Protection Division • Updated quarterly</p>
                  <p className="mt-2">
                    Questions? Call{' '}
                    <a 
                      href="tel:404-656-4713" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      (404) 656-4713
                    </a>
                  </p>
                </div>
                <div className="flex justify-center space-x-6 text-sm">
                  <a 
                    href="https://epd.georgia.gov" 
                    className="text-gray-600 hover:text-gray-800"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Georgia EPD
                  </a>
                  <a 
                    href="https://www.epa.gov/ground-water-and-drinking-water" 
                    className="text-gray-600 hover:text-gray-800"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    EPA Water Info
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}