/** Shared context for deal, partnership, or organization detail workspaces. */
export type WorkspaceContext =
  | { kind: "deal"; id: string; organizationId: string }
  | { kind: "partnership"; id: string; organizationId: string }
  | { kind: "organization"; id: string; organizationId: string; basePath: string };

export function workspacePath(ctx: WorkspaceContext): string {
  if (ctx.kind === "deal") return `/pipeline/${ctx.id}`;
  if (ctx.kind === "partnership") return `/partnerships/${ctx.id}`;
  return ctx.basePath;
}
