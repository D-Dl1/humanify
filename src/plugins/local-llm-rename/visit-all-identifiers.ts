import { parseAsync, transformFromAstAsync, NodePath } from "@babel/core";
import * as babelTraverse from "@babel/traverse";
import { Identifier, toIdentifier, Node } from "@babel/types";
import { isPauseRequested } from "../../state-manager.js";

const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- This hack is because pkgroll fucks up the import somehow

type Visitor = (name: string, scope: string) => Promise<string>;

export async function visitAllIdentifiers(
  code: string,
  visitor: Visitor,
  contextWindowSize: number,
  onProgress?: (percentageDone: number) => void
) {
  const ast = await parseAsync(code, { sourceType: "unambiguous" });
  const renames = new Set<string>();
  const visited = new Set<string>();

  if (!ast) {
    throw new Error("Failed to parse code");
  }

  const scopes = await findScopes(ast);
  const numRenamesExpected = scopes.length;

  for (const smallestScope of scopes) {
    // Check for pause request before processing each identifier
    if (isPauseRequested()) {
      console.log("\n⏸️  Pause requested, stopping identifier processing...");
      break;
    }

    if (hasVisited(smallestScope, visited)) continue;

    const smallestScopeNode = smallestScope.node;
    if (smallestScopeNode.type !== "Identifier") {
      throw new Error("No identifiers found");
    }

    const surroundingCode = await scopeToString(
      smallestScope,
      contextWindowSize
    );

    try {
      const renamed = await visitor(smallestScopeNode.name, surroundingCode);
      if (renamed !== smallestScopeNode.name) {
        let safeRenamed = toIdentifier(renamed);
        while (
          renames.has(safeRenamed) ||
          smallestScope.scope.hasBinding(safeRenamed)
        ) {
          safeRenamed = `_${safeRenamed}`;
        }
        renames.add(safeRenamed);

        smallestScope.scope.rename(smallestScopeNode.name, safeRenamed);
      }
      markVisited(smallestScope, smallestScopeNode.name, visited);

      onProgress?.(visited.size / numRenamesExpected);
    } catch (error) {
      // Check if it's a network error and should pause
      if (error instanceof Error && (
        error.message.includes("ENOTFOUND") || 
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch failed")
      )) {
        console.log(`\n🌐 Network error while processing '${smallestScopeNode.name}': ${error.message}`);
        throw error; // Re-throw to be handled by the calling function
      }
      
      console.warn(`⚠️  Failed to rename '${smallestScopeNode.name}': ${error.message}`);
      // Mark as visited even if renaming failed to avoid infinite loops
      markVisited(smallestScope, smallestScopeNode.name, visited);
      onProgress?.(visited.size / numRenamesExpected);
    }
  }
  onProgress?.(1);

  const stringified = await transformFromAstAsync(ast);
  if (stringified?.code == null) {
    throw new Error("Failed to stringify code");
  }
  return stringified.code;
}

function findScopes(ast: Node): NodePath<Identifier>[] {
  const scopes: [nodePath: NodePath<Identifier>, scopeSize: number][] = [];
  traverse(ast, {
    BindingIdentifier(path) {
      const bindingBlock = closestSurroundingContextPath(path).scope.block;
      const pathSize = bindingBlock.end! - bindingBlock.start!;

      scopes.push([path, pathSize]);
    }
  });

  scopes.sort((a, b) => b[1] - a[1]);

  return scopes.map(([nodePath]) => nodePath);
}

function hasVisited(path: NodePath<Identifier>, visited: Set<string>) {
  return visited.has(path.node.name);
}

function markVisited(
  path: NodePath<Identifier>,
  newName: string,
  visited: Set<string>
) {
  visited.add(newName);
}

async function scopeToString(
  path: NodePath<Identifier>,
  contextWindowSize: number
) {
  const surroundingPath = closestSurroundingContextPath(path);
  const code = `${surroundingPath}`; // Implements a hidden `.toString()`
  if (code.length < contextWindowSize) {
    return code;
  }
  if (surroundingPath.isProgram()) {
    const start = path.node.start ?? 0;
    const end = path.node.end ?? code.length;
    if (end < contextWindowSize / 2) {
      return code.slice(0, contextWindowSize);
    }
    if (start > code.length - contextWindowSize / 2) {
      return code.slice(-contextWindowSize);
    }

    return code.slice(
      start - contextWindowSize / 2,
      end + contextWindowSize / 2
    );
  } else {
    return code.slice(0, contextWindowSize);
  }
}

function closestSurroundingContextPath(
  path: NodePath<Identifier>
): NodePath<Node> {
  const programOrBindingNode = path.findParent(
    (p) => p.isProgram() || path.node.name in p.getOuterBindingIdentifiers()
  )?.scope.path;
  return programOrBindingNode ?? path.scope.path;
}
