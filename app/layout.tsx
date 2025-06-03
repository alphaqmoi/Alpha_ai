import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarWrapper } from "@/components/sidebar"
import { TaskManagerProvider } from "@/components/task-manager"
import Script from "next/script"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Alpha AI",
  description: "Next-generation AI platform",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Removed ThemeScript */}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TaskManagerProvider>
            <SidebarWrapper>
              <ErrorBoundary>
                <main className="flex-1">{children}</main>
              </ErrorBoundary>
            </SidebarWrapper>
          </TaskManagerProvider>
        </ThemeProvider>
        <Script
          id="init-background-service"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize background service
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    // Register service worker
                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/service-worker.js')
                          .then(registration => {
                            console.log('ServiceWorker registration successful with scope: ', registration.scope);
                          })
                          .catch(err => {
                            console.log('ServiceWorker registration failed: ', err);
                          });
                      });
                    }
                    
                    // Set up periodic sync for trading
                    if ('periodicSync' in navigator.serviceWorker) {
                      navigator.serviceWorker.ready.then(async (registration) => {
                        try {
                          await registration.periodicSync.register('trading-periodic-sync', {
                            minInterval: 60 * 1000 // 1 minute
                          });
                          console.log('Periodic sync registered');
                        } catch (error) {
                          console.error('Periodic sync could not be registered:', error);
                        }
                      });
                    }
                    
                    // Initialize background fetch for AI model warming
                    const keepModelWarm = () => {
                      fetch('/api/training')
                        .then(response => response.json())
                        .then(data => {
                          if (!data.isTraining && data.progress < 100) {
                            fetch('/api/training', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ action: 'start' }),
                            });
                          }
                        })
                        .catch(err => console.error('Error keeping model warm:', err));
                    };
                    
                    // Run immediately and then every 5 minutes
                    keepModelWarm();
                    setInterval(keepModelWarm, 5 * 60 * 1000);
                  }
                } catch (error) {
                  console.error('Error initializing background service:', error);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
