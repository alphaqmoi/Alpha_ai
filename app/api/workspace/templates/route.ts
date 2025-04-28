import { NextResponse } from "next/server"

// Mock templates
const templates = {
  development: {
    name: "Development",
    description: "Perfect for coding and development tasks",
    layout: "split",
    panels: [
      { id: "code", type: "code_editor", position: "main", title: "Code Editor" },
      { id: "terminal", type: "terminal", position: "bottom", title: "Terminal" },
      { id: "files", type: "file_explorer", position: "left", title: "Files" },
      { id: "chat", type: "chat", position: "right", title: "AI Assistant" },
    ],
    tools: ["save", "share", "refresh", "debug", "deploy"],
  },
  media: {
    name: "Media Production",
    description: "For video and audio editing",
    layout: "complex",
    panels: [
      { id: "player", type: "media_player", position: "main", title: "Media Player" },
      { id: "timeline", type: "timeline", position: "bottom", title: "Timeline" },
      { id: "library", type: "file_explorer", position: "left", title: "Media Library" },
      { id: "effects", type: "canvas", position: "right", title: "Effects" },
    ],
    tools: ["save", "export", "import", "preview", "publish"],
  },
  writing: {
    name: "Content Creation",
    description: "For writing and content creation",
    layout: "focused",
    panels: [
      { id: "editor", type: "text_editor", position: "main", title: "Text Editor" },
      { id: "research", type: "chat", position: "right", title: "Research Assistant" },
      { id: "outline", type: "file_explorer", position: "left", title: "Outline" },
    ],
    tools: ["save", "export", "publish", "format", "research"],
  },
}

export async function GET() {
  return NextResponse.json({ templates })
}
