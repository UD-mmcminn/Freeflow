import { Request } from 'express'

// Placeholder search options builder; narrow scope later.
export const getWorkspaceSearchOptions = (workspaceId?: string) => {
    return workspaceId ? { workspaceId } : {}
}

export const getWorkspaceSearchOptionsFromReq = (req: Request) => {
    const workspaceId = (req.user as any)?.activeWorkspaceId
    return getWorkspaceSearchOptions(workspaceId)
}
