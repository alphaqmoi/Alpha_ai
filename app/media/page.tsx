"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MediaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to the Media page! Here you can manage your media files.</p>
          {/* Add media management features here */}
        </CardContent>
      </Card>
    </div>
  );
}