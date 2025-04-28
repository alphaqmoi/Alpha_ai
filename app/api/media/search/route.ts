import { NextResponse } from "next/server"

// Mock media database
const mediaDatabase = {
  videos: Array.from({ length: 12 }, (_, i) => ({
    id: `video-${i + 1}`,
    title: `Video ${i + 1}`,
    type: "video",
    thumbnail: `/placeholder.svg?height=80&width=120&text=Video+${i + 1}`,
    duration: 60 + (i + 1) * 30,
    url: `#video-${i + 1}`,
  })),
  audio: Array.from({ length: 12 }, (_, i) => ({
    id: `audio-${i + 1}`,
    title: `Audio ${i + 1}`,
    type: "audio",
    duration: 60 + (i + 1) * 30,
    url: `#audio-${i + 1}`,
  })),
  images: Array.from({ length: 12 }, (_, i) => ({
    id: `image-${i + 1}`,
    title: `Image ${i + 1}`,
    type: "image",
    thumbnail: `/placeholder.svg?height=80&width=120&text=Image+${i + 1}`,
    url: `#image-${i + 1}`,
  })),
  documents: Array.from({ length: 12 }, (_, i) => ({
    id: `document-${i + 1}`,
    title: `Document ${i + 1}`,
    type: "document",
    url: `#document-${i + 1}`,
  })),
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "videos"
  const query = searchParams.get("query") || ""

  // Get media items of the specified type
  const items = mediaDatabase[type as keyof typeof mediaDatabase] || []

  // Filter by query if provided
  const results = query ? items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())) : items

  return NextResponse.json({ results })
}
