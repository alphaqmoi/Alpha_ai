import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Ensure the revalidate property is correctly defined as a static export
export const revalidate = 60; // Cache the page for 60 seconds

export default function QWorkspacePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Alpha Q AI Workspace</h1>
      <Tabs className="space-y-4">
        <TabsList className="grid grid-cols-7 md:w-[1050px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="code-runner">Code Runner</TabsTrigger>
          <TabsTrigger value="media-studio">Media Studio</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="app-launcher">App Launcher</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>AI Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View real-time AI status and task queue here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input type="file" />
                <Button>Upload</Button>
              </div>
              <Button variant="outline" className="mt-4">Download Files</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code-runner">
          <Card>
            <CardHeader>
              <CardTitle>Code Runner</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Run your code and view output here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media-studio">
          <Card>
            <CardHeader>
              <CardTitle>Media Studio</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create animations, videos, and images here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminal">
          <Card>
            <CardHeader>
              <CardTitle>Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Run commands in the terminal emulator.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app-launcher">
          <Card>
            <CardHeader>
              <CardTitle>App Launcher</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage and deploy your apps here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configure your workspace settings here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}