/** Shared context for deal or partnership detail workspaces. */
export type WorkspaceContext =
  | { kind: "deal"; id: string; organizationId: string }
  | { kind: "partnership"; id: string; organizationId: string };

export function workspacePath(ctx: WorkspaceContext): string {
  return ctx.kind === "deal" ? `/pipeline/${ctx.id}` : `/partnerships/${ctx.id}`;
}
