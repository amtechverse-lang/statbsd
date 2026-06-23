"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

function renderMathInText(text: string): string {
  let result = text;
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  });
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });
  return result;
}

export function MathRenderer({ content }: { content: string }) {
  const html = useMemo(() => renderMathInText(content), [content]);
  return (
    <div
      className="math-content prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
