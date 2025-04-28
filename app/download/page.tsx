"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Download, Smartphone, Laptop, Globe } from "lucide-react"
import Link from "next/link"
import { AppDownload } from "@/components/app-download"

export default function DownloadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("mobile")

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <Download className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Download Alpha AI</h1>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="mobile" value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="mobile">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="desktop">
                <Laptop className="h-4 w-4 mr-2" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="web">
                <Globe className="h-4 w-4 mr-2" />
                Web App
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Apps</CardTitle>
                  <CardDescription>Download Alpha AI for your smartphone or tablet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Android App
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">For Android 8.0 and above</p>
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download APK
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          iOS App
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">For iOS 14 and above</p>
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          App Store
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="desktop" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Desktop Applications</CardTitle>
                  <CardDescription>Download Alpha AI for your computer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Laptop className="h-5 w-5" />
                          Windows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">For Windows 10 and 11</p>
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download EXE
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Laptop className="h-5 w-5" />
                          macOS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">For macOS 11 and above</p>
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download DMG
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="web" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Web Application</CardTitle>
                  <CardDescription>Use Alpha AI directly in your browser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The web version of Alpha AI is always up-to-date and requires no installation. Simply bookmark this
                    page or install it as a Progressive Web App for easy access.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Button className="w-full">
                      <Globe className="mr-2 h-4 w-4" />
                      Open Web App
                    </Button>

                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Install as PWA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AppDownload />
        </div>
      </div>
    </div>
  )
}
