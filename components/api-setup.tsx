import { useState } from "react";
import supabase from "@/lib/utils";

export default function ApiSetup() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-api-key");
      const data = await response.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
      } else {
        alert("Failed to generate API key.");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      alert("An error occurred while generating the API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Setup</CardTitle>
        <CardDescription>Generate and manage your API key for accessing Alpha AI services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Your API Key</Label>
          <Input id="api-key" value={apiKey} readOnly placeholder="Click 'Generate' to create an API key" />
        </div>
        <Button onClick={generateApiKey} disabled={loading}>
          {loading ? "Generating..." : "Generate API Key"}
        </Button>
      </CardContent>
    </Card>
  );
}