import { NextResponse } from "next/server"

// Mock templates (same as in templates route)
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

// Mock workspace database
const workspaces = new Map()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { workspace_id, template_id } = body

    if (!workspace_id || !template_id) {
      return NextResponse.json({ error: "Workspace ID and template ID are required" }, { status: 400 })
    }

    // Get template
    const template = templates[template_id as keyof typeof templates]
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Get workspace
    const workspace = workspaces.get(workspace_id)
    if (!workspace) {
      // Create new workspace with template
      const newWorkspace = {
        id: workspace_id,
        name: `Workspace ${workspace_id}`,
        template: template.name,
        layout: template.layout,
        panels: template.panels,
        tools: template.tools,
      }

      workspaces.set(workspace_id, newWorkspace)

      return NextResponse.json({ status: "success", workspace: newWorkspace })
    }

    // Update existing workspace with template
    const updatedWorkspace = {
      ...workspace,
      template: template.name,
      layout: template.layout,
      panels: template.panels,
      tools: template.tools,
    }

    workspaces.set(workspace_id, updatedWorkspace)

    return NextResponse.json({ status: "success", workspace: updatedWorkspace })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
