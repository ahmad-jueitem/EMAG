import { useMemo } from "react";
import { renderLatex } from "@/lib/katex-utils";
import "katex/dist/katex.min.css";

interface KatexRendererProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export default function KatexRenderer({ latex, display = false, className = "" }: KatexRendererProps) {
  const html = useMemo(() => renderLatex(latex, display), [latex, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
