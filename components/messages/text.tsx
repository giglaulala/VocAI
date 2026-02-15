import React from "react";

const URL_RE =
  /\bhttps?:\/\/[^\s<>()\[\]]+[^\s<>().,;:"')\]\s]/gi;

export function LinkifiedText({ text }: { text: string }) {
  const parts: Array<{ type: "text" | "link"; value: string }> = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = match[0];
    const idx = match.index ?? -1;
    if (idx < 0) continue;
    if (idx > last) parts.push({ type: "text", value: text.slice(last, idx) });
    parts.push({ type: "link", value: url });
    last = idx + url.length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

  if (parts.length === 0) return <>{text}</>;

  return (
    <>
      {parts.map((p, i) =>
        p.type === "link" ? (
          <a
            key={i}
            href={p.value}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 text-primary-700 hover:text-primary-800"
          >
            {p.value}
          </a>
        ) : (
          <React.Fragment key={i}>{p.value}</React.Fragment>
        ),
      )}
    </>
  );
}

