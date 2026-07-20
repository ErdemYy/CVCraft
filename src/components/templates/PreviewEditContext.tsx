"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, FormEvent, KeyboardEvent } from "react";
import { resolveFontFamily } from "@/lib/font-options";
import type { CVLayoutBlockId, CVTextStyle, SectionColumn, SectionId } from "@/lib/cv-types";

type EditableFieldChange = (fieldId: string, value: string, html?: string) => void;
type RichTextChange = (fieldId: string, html: string) => void;
type SectionDropPosition = "before" | "after";

interface PreviewEditContextValue {
  editable: boolean;
  activeFieldId: string | null;
  globalStyle: Partial<CVTextStyle>;
  textStyles: Record<string, Partial<CVTextStyle>>;
  richText: Record<string, string>;
  onActiveFieldChange?: (fieldId: string | null) => void;
  onFieldChange?: EditableFieldChange;
  onRichTextChange?: RichTextChange;
  onSectionDrop?: (sourceId: SectionId, targetId: SectionId, position: SectionDropPosition) => void;
  onSectionColumnDrop?: (sourceId: SectionId, column: SectionColumn) => void;
  onLayoutBlockColumnDrop?: (blockId: CVLayoutBlockId, column: SectionColumn) => void;
}

const PreviewEditContext = createContext<PreviewEditContextValue>({
  editable: false,
  activeFieldId: null,
  globalStyle: {},
  textStyles: {},
  richText: {},
});

export function PreviewEditProvider({
  children,
  editable = false,
  activeFieldId = null,
  globalStyle = {},
  textStyles = {},
  richText = {},
  onActiveFieldChange,
  onFieldChange,
  onRichTextChange,
  onSectionDrop,
  onSectionColumnDrop,
  onLayoutBlockColumnDrop,
}: PreviewEditContextValue & { children: React.ReactNode }) {
  useEffect(() => {
    if (!editable) return;
    document.addEventListener("selectionchange", rememberSelection);
    return () => document.removeEventListener("selectionchange", rememberSelection);
  }, [editable]);

  const value = useMemo(
    () => ({
      editable,
      activeFieldId,
      globalStyle,
      textStyles,
      richText,
      onActiveFieldChange,
      onFieldChange,
      onRichTextChange,
      onSectionDrop,
      onSectionColumnDrop,
      onLayoutBlockColumnDrop,
    }),
    [editable, activeFieldId, globalStyle, textStyles, richText, onActiveFieldChange, onFieldChange, onRichTextChange, onSectionDrop, onSectionColumnDrop, onLayoutBlockColumnDrop],
  );

  return <PreviewEditContext.Provider value={value}>{children}</PreviewEditContext.Provider>;
}

function rememberSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const anchorNode = selection.anchorNode;
  const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
  const anchor = anchorElement?.closest("[data-editable-field]");
  if (!anchor) return;
  (window as unknown as { __cvcraftSelection?: Range }).__cvcraftSelection = selection.getRangeAt(0).cloneRange();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toReactTextStyle(style: Partial<CVTextStyle>): React.CSSProperties {
  return {
    fontFamily: style.fontFamily ? resolveFontFamily(style.fontFamily) : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.isBold ? 800 : undefined,
    fontStyle: style.isItalic ? "italic" : undefined,
    textDecoration: [
      style.isUnderlined ? "underline" : "",
      style.isStrikethrough ? "line-through" : "",
    ].filter(Boolean).join(" ") || undefined,
    color: style.textColor || undefined,
    textAlign: style.alignment,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    textTransform: style.textTransform && style.textTransform !== "none" ? style.textTransform : undefined,
    marginLeft: style.indentLevel ? `${style.indentLevel * 12}px` : undefined,
  };
}

function getListStyle(type: CVTextStyle["listStyle"]) {
  if (!type) return undefined;
  if (type === "dash") return "\"-  \"";
  if (type === "alpha") return "lower-alpha";
  return type;
}

export function useEditableTextStyle(fieldId?: string) {
  const context = useContext(PreviewEditContext);
  const fieldStyle = fieldId ? context.textStyles[fieldId] ?? {} : {};
  return {
    ...context.globalStyle,
    ...fieldStyle,
  };
}

export function EditableText({
  fieldId,
  value,
  as = "span",
  multiline = false,
  singleLine = false,
  className,
  style,
  placeholder = "",
}: {
  fieldId: string;
  value: string;
  as?: React.ElementType;
  multiline?: boolean;
  singleLine?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const context = useContext(PreviewEditContext);
  const textStyle = useEditableTextStyle(fieldId);
  const resolvedStyle = { ...style, ...toReactTextStyle(textStyle) };
  const richHtml = context.richText[fieldId];
  const initialHtml = richHtml || escapeHtml(value || placeholder);
  const elementRef = useRef<HTMLElement | null>(null);
  const htmlRef = useRef(initialHtml);
  const mountedField = useRef(fieldId);
  const original = useRef(value);
  const originalHtml = useRef(initialHtml);
  const Tag = as as React.ElementType;
  const isActive = context.activeFieldId === fieldId;

  useEffect(() => {
    if (isActive) return;
    const nextHtml = richHtml || escapeHtml(value || placeholder);
    htmlRef.current = nextHtml;
    if (elementRef.current && elementRef.current.innerHTML !== nextHtml) {
      elementRef.current.innerHTML = nextHtml;
    }
  }, [fieldId, isActive, placeholder, richHtml, value]);

  const commit = (nextValue: string, nextHtml: string) => {
    const cleaned = singleLine ? nextValue.replace(/\s+/g, " ").trim() : nextValue.trimEnd();
    context.onFieldChange?.(fieldId, cleaned, nextHtml);
  };

  if (!context.editable) {
    if (richHtml) {
      return <Tag className={className} style={resolvedStyle} dangerouslySetInnerHTML={{ __html: richHtml }} />;
    }

    const lines = multiline && textStyle.listStyle
      ? value.split(/\r?\n/).map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean)
      : [];

    if (lines.length > 0) {
      const ListTag = textStyle.listStyle === "decimal" || textStyle.listStyle === "alpha" ? "ol" : "ul";
      return (
        <ListTag
          className={className}
          style={{
            ...resolvedStyle,
            listStyleType: getListStyle(textStyle.listStyle),
            paddingLeft: "1.2em",
            margin: style?.margin ?? 0,
          }}
        >
          {lines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
        </ListTag>
      );
    }

    return <Tag className={className} style={resolvedStyle}>{value || placeholder}</Tag>;
  }

  return (
    <Tag
      suppressContentEditableWarning
      contentEditable
      data-editable-field={fieldId}
      ref={(node: HTMLElement | null) => {
        elementRef.current = node;
        if (!node) return;
        if (mountedField.current !== fieldId) {
          mountedField.current = fieldId;
          htmlRef.current = initialHtml;
          node.innerHTML = initialHtml;
          return;
        }
        if (!node.innerHTML) node.innerHTML = htmlRef.current;
      }}
      spellCheck={false}
      className={className}
      style={{
        ...resolvedStyle,
        minHeight: multiline ? "1.4em" : undefined,
        outline: isActive ? "2px solid rgba(176,141,87,0.55)" : "1px solid transparent",
        outlineOffset: "2px",
        borderRadius: "3px",
        cursor: "text",
        whiteSpace: multiline ? "pre-line" : undefined,
      }}
      onFocus={(event: FocusEvent<HTMLElement>) => {
        original.current = value;
        originalHtml.current = event.currentTarget.innerHTML || initialHtml;
        htmlRef.current = event.currentTarget.innerHTML || initialHtml;
        context.onActiveFieldChange?.(fieldId);
        requestAnimationFrame(rememberSelection);
      }}
      onInput={(event: FormEvent<HTMLElement>) => {
        htmlRef.current = event.currentTarget.innerHTML;
        requestAnimationFrame(rememberSelection);
      }}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        htmlRef.current = event.currentTarget.innerHTML;
        commit(event.currentTarget.innerText, event.currentTarget.innerHTML);
        context.onActiveFieldChange?.(null);
      }}
      onMouseUp={rememberSelection}
      onKeyUp={rememberSelection}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape") {
          event.currentTarget.innerText = original.current;
          event.currentTarget.innerHTML = originalHtml.current;
          htmlRef.current = originalHtml.current;
          event.currentTarget.blur();
          return;
        }

        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function DraggableSection({
  sectionId,
  children,
}: {
  sectionId: SectionId;
  children: React.ReactNode;
}) {
  const context = useContext(PreviewEditContext);
  const [dropPosition, setDropPosition] = useState<SectionDropPosition | null>(null);

  if (!context.editable || !context.onSectionDrop) {
    return <>{children}</>;
  }

  const resolveDropPosition = (event: React.DragEvent<HTMLElement>): SectionDropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  };

  return (
    <div
      data-cv-section={sectionId}
      onDragOver={(event) => {
        event.preventDefault();
        setDropPosition(resolveDropPosition(event));
      }}
      onDragLeave={() => setDropPosition(null)}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const position = resolveDropPosition(event);
        setDropPosition(null);
        const source = event.dataTransfer.getData("text/cv-section");
        const drop = context.onSectionDrop;
        if (source && source !== sectionId && drop) drop(source, sectionId, position);
      }}
      style={{
        position: "relative",
        borderRadius: "4px",
        outline: dropPosition ? "1px solid rgba(176,141,87,0.35)" : "1px solid transparent",
        outlineOffset: "4px",
        transition: "outline-color 160ms ease, background-color 160ms ease",
      }}
    >
      {dropPosition && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            [dropPosition === "before" ? "top" : "bottom"]: "-7px",
            height: "3px",
            borderRadius: "999px",
            background: "#B08D57",
            boxShadow: "0 0 0 3px rgba(176,141,87,0.16)",
            zIndex: 6,
            pointerEvents: "none",
          }}
        />
      )}
      <button
        type="button"
        draggable
        onMouseDown={(event) => event.stopPropagation()}
        onDragStart={(event) => {
          event.dataTransfer.setData("text/cv-section", String(sectionId));
          event.dataTransfer.effectAllowed = "move";
        }}
        style={{
          position: "absolute",
          right: "4px",
          top: "4px",
          zIndex: 5,
          width: "20px",
          height: "20px",
          borderRadius: "7px",
          border: "1px solid rgba(176,141,87,0.45)",
          background: "rgba(255,255,255,0.9)",
          color: "#B08D57",
          fontSize: "12px",
          lineHeight: "18px",
          textAlign: "center",
          cursor: "grab",
          boxShadow: "0 4px 12px rgba(43,42,40,0.12)",
          userSelect: "none",
        }}
        title="Bölümü sürükle"
      >
        ⋮⋮
      </button>
      {children}
    </div>
  );
}

export function DraggableLayoutBlock({
  blockId,
  children,
}: {
  blockId: CVLayoutBlockId;
  children: React.ReactNode;
}) {
  const context = useContext(PreviewEditContext);

  if (!context.editable || !context.onLayoutBlockColumnDrop) {
    return <>{children}</>;
  }

  return (
    <div
      data-cv-layout-block={blockId}
      style={{
        position: "relative",
        borderRadius: "4px",
        outline: "1px solid transparent",
        outlineOffset: "4px",
      }}
    >
      <button
        type="button"
        draggable
        onMouseDown={(event) => event.stopPropagation()}
        onDragStart={(event) => {
          event.dataTransfer.setData("text/cv-layout-block", blockId);
          event.dataTransfer.effectAllowed = "move";
        }}
        style={{
          position: "absolute",
          right: "4px",
          top: "4px",
          zIndex: 5,
          width: "20px",
          height: "20px",
          borderRadius: "7px",
          border: "1px solid rgba(176,141,87,0.45)",
          background: "rgba(255,255,255,0.92)",
          color: "#B08D57",
          fontSize: "12px",
          lineHeight: "18px",
          textAlign: "center",
          cursor: "grab",
          boxShadow: "0 4px 12px rgba(43,42,40,0.12)",
          userSelect: "none",
        }}
        title="Alanı diğer sütuna taşı"
        aria-label="Alanı sürükle"
      >
        ⋮⋮
      </button>
      {children}
    </div>
  );
}

export function ColumnDropZone({
  column,
  as = "div",
  children,
  style,
  dropLabel,
}: {
  column: SectionColumn;
  as?: React.ElementType;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dropLabel?: string;
}) {
  const context = useContext(PreviewEditContext);
  const [dragOver, setDragOver] = useState(false);
  const Tag = as as React.ElementType;

  if (!context.editable || (!context.onSectionColumnDrop && !context.onLayoutBlockColumnDrop)) {
    return <Tag style={style}>{children}</Tag>;
  }

  return (
    <Tag
      data-cv-column={column}
      style={{
        ...style,
        position: style?.position ?? "relative",
        outline: dragOver ? "2px solid rgba(176,141,87,0.7)" : "2px solid transparent",
        outlineOffset: "-4px",
        transition: "outline-color 160ms ease, background-color 160ms ease",
      }}
      onDragEnter={(event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={(event: React.DragEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
      }}
      onDrop={(event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        setDragOver(false);
        const layoutBlock = event.dataTransfer.getData("text/cv-layout-block") as CVLayoutBlockId;
        if (layoutBlock) {
          context.onLayoutBlockColumnDrop?.(layoutBlock, column);
          return;
        }
        const source = event.dataTransfer.getData("text/cv-section");
        if (source) context.onSectionColumnDrop?.(source, column);
      }}
    >
      {dragOver && (
        <div
          style={{
            position: "absolute",
            inset: "8px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed rgba(176,141,87,0.75)",
            background: "rgba(255,255,255,0.84)",
            color: "#7A5D34",
            fontSize: "11px",
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          {dropLabel || (column === "sidebar" ? "Yan sütuna bırak" : "Ana alana bırak")}
        </div>
      )}
      {children}
    </Tag>
  );
}
