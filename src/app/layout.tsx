import type { Metadata } from 'next'
import { StoreProvider } from '@/lib/Store'
import './globals.css'

export const metadata: Metadata = {
    title: 'YOUPLAN',
    description: 'Your elegant personal productivity space.',
    icons: {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✈️</text></svg>'
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <StoreProvider>
                    <div id="app-root">
                        {children}
                    </div>
                </StoreProvider>
            </body>
        </html>
    )
}
