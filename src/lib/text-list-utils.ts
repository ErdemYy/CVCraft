import type { KeyboardEvent } from "react";

const BULLET_PATTERN = /^(\s*)([-*•▪▫]|\d+[.)]|[a-zA-Z][.)])\s+/;

function getCurrentLine(value: string, selectionStart: number) {
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = value.indexOf("\n", selectionStart);
  return {
    lineStart,
    lineEnd: lineEnd === -1 ? value.length : lineEnd,
    text: value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd),
  };
}

function nextNumber(marker: string) {
  const number = marker.match(/^(\d+)/)?.[1];
  if (number) return `${Number(number) + 1}.`;
  const letter = marker.match(/^([a-zA-Z])/)?.[1];
  if (letter) return `${String.fromCharCode(letter.charCodeAt(0) + 1)}.`;
  return marker;
}

export function handleListTextareaKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void,
) {
  const target = event.currentTarget;
  const { value, selectionStart, selectionEnd } = target;
  const line = getCurrentLine(value, selectionStart);
  const match = line.text.match(BULLET_PATTERN);

  if (event.key === "Tab") {
    event.preventDefault();
    const indent = event.shiftKey ? -2 : 2;
    const nextLine = indent > 0
      ? `  ${line.text}`
      : line.text.replace(/^ {1,2}/, "");
    const nextValue = `${value.slice(0, line.lineStart)}${nextLine}${value.slice(line.lineEnd)}`;
    onChange(nextValue);
    window.requestAnimationFrame(() => {
      const nextPosition = Math.max(line.lineStart, selectionStart + indent);
      target.setSelectionRange(nextPosition, nextPosition);
    });
    return;
  }

  if (event.key !== "Enter" || !match) return;

  event.preventDefault();
  const [, indent, marker] = match;
  const content = line.text.replace(BULLET_PATTERN, "").trim();

  if (!content) {
    const nextValue = `${value.slice(0, line.lineStart)}${indent}${value.slice(line.lineEnd)}`;
    onChange(nextValue);
    window.requestAnimationFrame(() => target.setSelectionRange(line.lineStart + indent.length, line.lineStart + indent.length));
    return;
  }

  const nextMarker = nextNumber(marker);
  const insert = `\n${indent}${nextMarker} `;
  const nextValue = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`;
  onChange(nextValue);
  window.requestAnimationFrame(() => {
    const nextPosition = selectionStart + insert.length;
    target.setSelectionRange(nextPosition, nextPosition);
  });
}
