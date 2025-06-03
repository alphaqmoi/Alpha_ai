"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkshopPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Workshop</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to the Workshop! Here you can access all tools and features.</p>
          {/* Add workshop tools and features here */}
        </CardContent>
      </Card>
    </div>
  );
}