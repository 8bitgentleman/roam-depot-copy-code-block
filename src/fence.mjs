// Pure fence parsing for Roam block strings. No DOM or Roam references.

// Modified regex to handle hyphens and other special characters in language names.
// Reuse the opening fence length so shorter nested fences stay in the code.
const codeBlockRegex = /(`{3,})([a-zA-Z0-9+#\-_ ]*)([\s\S]*?)\1/;

export function extractCode(blockString) {
  if (typeof blockString !== "string") return null;
  const match = blockString.match(codeBlockRegex);
  return match ? match[3].trim() : null;
}
