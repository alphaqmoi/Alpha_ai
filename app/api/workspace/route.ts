import { NextResponse } from "next/server"

// Mock database for workspaces
const workspaces = new Map()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    // Get specific workspace
    const workspace = workspaces.get(id)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    return NextResponse.json({ workspace })
  }

  // Get all workspaces
  return NextResponse.json({
    workspaces: Array.from(workspaces.entries()).map(([id, workspace]) => ({
      id,
      name: workspace.name,
      template: workspace.template,
    })),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, template } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Create new workspace
    const id = `ws_${Date.now()}`
    const workspace = {
      id,
      name,
      template: template || "Default",
      layout: "simple",
      panels: [
        { id: "main", type: "code_editor", position: "main", title: "Code Editor" },
        { id: "terminal", type: "terminal", position: "bottom", title: "Terminal" },
        { id: "explorer", type: "file_explorer", position: "left", title: "Explorer" },
        { id: "chat", type: "chat", position: "right", title: "AI Assistant" },
      ],
      tools: ["save", "share", "refresh"],
    }

    workspaces.set(id, workspace)

    return NextResponse.json({ workspace })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, updates } = body

    if (!id || !updates) {
      return NextResponse.json({ error: "ID and updates are required" }, { status: 400 })
    }

    // Get workspace
    const workspace = workspaces.get(id)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Update workspace
    const updatedWorkspace = { ...workspace, ...updates }
    workspaces.set(id, updatedWorkspace)

    return NextResponse.json({ workspace: updatedWorkspace })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  // Delete workspace
  const deleted = workspaces.delete(id)
  if (!deleted) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
