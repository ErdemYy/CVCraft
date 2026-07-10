"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CVTextStyle, ListStyleType, TextAlignment } from "@/lib/cv-types";
import { FONT_OPTIONS, getFontLabel, resolveFontFamily } from "@/lib/font-options";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseSensitive,
  Eraser,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Search,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

const LIST_OPTIONS: Array<{ id: ListStyleType | null; label: string }> = [
  { id: null, label: "Normal" },
  { id: "disc", label: "Dolu" },
  { id: "circle", label: "Boş" },
  { id: "square", label: "Kare" },
  { id: "dash", label: "Tire" },
  { id: "decimal", label: "1,2,3" },
  { id: "alpha", label: "a,b,c" },
];

const ALIGN_OPTIONS: Array<{ id: TextAlignment; icon: ReactNode; title: string }> = [
  { id: "left", icon: <AlignLeft className="h-4 w-4" />, title: "Sola hizala" },
  { id: "center", icon: <AlignCenter className="h-4 w-4" />, title: "Ortala" },
  { id: "right", icon: <AlignRight className="h-4 w-4" />, title: "Sağa hizala" },
  { id: "justify", icon: <AlignJustify className="h-4 w-4" />, title: "İki yana yasla" },
];

const ALIGN_COMMANDS: Record<TextAlignment, string> = {
  left: "justifyLeft",
  center: "justifyCenter",
  right: "justifyRight",
  justify: "justifyFull",
};

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs transition-all ${
        active
          ? "border-[#B08D57] bg-[#B08D57]/10 text-[#B08D57]"
          : "border-[#E8E4DC] bg-white text-[#7A766E] hover:border-[#B08D57] hover:text-[#2B2A28]"
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

export default function RichTextToolbar({
  activeFieldId,
  style,
  onStyleChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  activeFieldId: string | null;
  style: Partial<CVTextStyle>;
  onStyleChange: (patch: Partial<CVTextStyle>) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const [fontQuery, setFontQuery] = useState("");
  const targetLabel = activeFieldId ? "Seçili alan" : "Tüm CV";
  const filteredFonts = useMemo(() => {
    const query = fontQuery.trim().toLocaleLowerCase("tr-TR");
    if (!query) return FONT_OPTIONS;
    return FONT_OPTIONS.filter((font) => font.label.toLocaleLowerCase("tr-TR").includes(query));
  }, [fontQuery]);

  const activeFont = style.fontFamily || "inter";
  const activeSize = style.fontSize ?? 11.5;
  const indentLevel = style.indentLevel ?? 0;

  const dispatchEditableInput = (element: Element | null) => {
    element?.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "formatSetBlockTextDirection" }));
  };

  const getEditableSelection = () => {
    const saved = (window as unknown as { __cvcraftSelection?: Range }).__cvcraftSelection;
    const selection = window.getSelection();
    const live = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const range = saved ?? live;
    const container = range?.commonAncestorContainer;
    const element = container instanceof Element ? container : container?.parentElement;
    const editable = element?.closest("[data-editable-field]");
    if (!range || !editable) return null;
    return { range, editable };
  };

  const wrapSelection = (patch: Partial<CVTextStyle>) => {
    const current = getEditableSelection();
    if (!current || current.range.collapsed) return false;

    const span = document.createElement("span");
    if (patch.fontFamily) span.style.fontFamily = resolveFontFamily(patch.fontFamily);
    if (patch.fontSize) span.style.fontSize = `${patch.fontSize}px`;
    if (patch.isBold !== undefined) span.style.fontWeight = patch.isBold ? "800" : "400";
    if (patch.isItalic !== undefined) span.style.fontStyle = patch.isItalic ? "italic" : "normal";
    if (patch.isUnderlined !== undefined || patch.isStrikethrough !== undefined) {
      span.style.textDecoration = [
        patch.isUnderlined ? "underline" : "",
        patch.isStrikethrough ? "line-through" : "",
      ].filter(Boolean).join(" ");
    }
    if (patch.textColor) span.style.color = patch.textColor;
    if (patch.letterSpacing !== undefined) span.style.letterSpacing = `${patch.letterSpacing}px`;
    if (patch.textTransform && patch.textTransform !== "none") span.style.textTransform = patch.textTransform;

    try {
      span.appendChild(current.range.extractContents());
      current.range.insertNode(span);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      selection?.addRange(nextRange);
      (window as unknown as { __cvcraftSelection?: Range }).__cvcraftSelection = nextRange.cloneRange();
      dispatchEditableInput(current.editable);
      return true;
    } catch {
      return false;
    }
  };

  const applyCommand = (command: string, value?: string) => {
    const current = getEditableSelection();
    if (!current || current.range.collapsed) return false;
    (current.editable as HTMLElement).focus({ preventScroll: true });
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(current.range);
    document.execCommand(command, false, value);
    if (selection && selection.rangeCount > 0) {
      (window as unknown as { __cvcraftSelection?: Range }).__cvcraftSelection = selection.getRangeAt(0).cloneRange();
    }
    dispatchEditableInput(current.editable);
    return true;
  };

  const applyStyle = (patch: Partial<CVTextStyle>, command?: string, commandValue?: string) => {
    const appliedToSelection = command ? applyCommand(command, commandValue) : wrapSelection(patch);
    if (!appliedToSelection && !activeFieldId) onStyleChange(patch);
  };

  const clearFormatting = () => {
    if (applyCommand("removeFormat")) return;
    if (!activeFieldId) onClear();
  };

  return (
    <div className="border-b border-[#E8E4DC] bg-white px-4 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-[#2B2A28]">
          Metin araçları <span className="font-normal text-[#7A766E]">· {targetLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <ToolbarButton title="Geri al" onClick={onUndo} disabled={!canUndo}><Undo2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton title="İleri al" onClick={onRedo} disabled={!canRedo}><Redo2 className="h-4 w-4" /></ToolbarButton>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex min-w-[220px] flex-col gap-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A766E]" />
            <input
              value={fontQuery}
              onChange={(event) => setFontQuery(event.target.value)}
              placeholder="Font ara"
              className="h-8 w-full rounded-lg border border-[#E8E4DC] bg-white pl-7 pr-2 text-xs outline-none focus:border-[#B08D57]"
            />
          </div>
          <select
            value={activeFont}
            onChange={(event) => applyStyle({ fontFamily: event.target.value })}
            className="h-8 rounded-lg border border-[#E8E4DC] bg-white px-2 text-xs outline-none focus:border-[#B08D57]"
            style={{ fontFamily: resolveFontFamily(activeFont) }}
          >
            <option value="inter">Şablon varsayılanı · Inter</option>
            {filteredFonts.map((font) => (
              <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                {font.label}
              </option>
            ))}
          </select>
          {fontQuery.trim() && (
            <div className="max-h-28 overflow-y-auto rounded-lg border border-[#E8E4DC] bg-white shadow-sm">
              {filteredFonts.slice(0, 8).map((font) => (
                <button
                  type="button"
                  key={font.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    applyStyle({ fontFamily: font.id });
                    setFontQuery("");
                  }}
                  className="block w-full px-2 py-1.5 text-left text-xs text-[#2B2A28] hover:bg-[#FAF9F6]"
                  style={{ fontFamily: font.family }}
                >
                  {font.label}
                </button>
              ))}
              {filteredFonts.length === 0 && (
                <div className="px-2 py-2 text-xs text-[#7A766E]">Font bulunamadı.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[#E8E4DC] bg-[#FAF9F6] px-1">
          <span className="px-2 text-[11px] text-[#7A766E]">{getFontLabel(activeFont)}</span>
          <input
            type="number"
            min={8}
            max={42}
            value={activeSize}
            onChange={(event) => applyStyle({ fontSize: Number(event.target.value) })}
            className="h-8 w-14 rounded-md border border-[#E8E4DC] bg-white px-2 text-xs outline-none focus:border-[#B08D57]"
            title="Yazı boyutu"
          />
        </div>

        <div className="flex gap-1">
          <ToolbarButton title="Kalın" active={style.isBold} onClick={() => applyStyle({ isBold: !style.isBold })}><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton title="İtalik" active={style.isItalic} onClick={() => applyStyle({ isItalic: !style.isItalic })}><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton title="Altı çizili" active={style.isUnderlined} onClick={() => applyStyle({ isUnderlined: !style.isUnderlined })}><Underline className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton title="Üstü çizili" active={style.isStrikethrough} onClick={() => applyStyle({ isStrikethrough: !style.isStrikethrough })}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        </div>

        <label className="flex h-8 items-center gap-2 rounded-lg border border-[#E8E4DC] bg-white px-2 text-xs text-[#7A766E]">
          <span>Renk</span>
          <input
            type="color"
            value={style.textColor || "#2B2A28"}
            onInput={(event) => applyStyle({ textColor: event.currentTarget.value })}
            onChange={(event) => applyStyle({ textColor: event.target.value })}
            className="h-5 w-7 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <div className="flex gap-1">
          {ALIGN_OPTIONS.map((option) => (
            <ToolbarButton
              key={option.id}
              title={option.title}
              active={(style.alignment ?? "left") === option.id}
              onClick={() => applyStyle({ alignment: option.id }, ALIGN_COMMANDS[option.id])}
            >
              {option.icon}
            </ToolbarButton>
          ))}
        </div>

        <select
          value={style.listStyle ?? ""}
          onChange={(event) => applyStyle({ listStyle: (event.target.value || null) as ListStyleType | null })}
          className="h-8 rounded-lg border border-[#E8E4DC] bg-white px-2 text-xs outline-none focus:border-[#B08D57]"
          title="Liste tipi"
        >
          {LIST_OPTIONS.map((option) => (
            <option key={option.label} value={option.id ?? ""}>{option.label}</option>
          ))}
        </select>
        <ToolbarButton title="Madde işaretli liste" active={Boolean(style.listStyle && style.listStyle !== "decimal" && style.listStyle !== "alpha")} onClick={() => applyStyle({ listStyle: style.listStyle ? null : "disc" }, "insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Numaralı liste" active={style.listStyle === "decimal"} onClick={() => applyStyle({ listStyle: style.listStyle === "decimal" ? null : "decimal" }, "insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>

        <ToolbarButton title="Girinti azalt" disabled={indentLevel <= 0} onClick={() => applyStyle({ indentLevel: Math.max(0, indentLevel - 1) }, "outdent")}><IndentDecrease className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Girinti artır" onClick={() => applyStyle({ indentLevel: indentLevel + 1 }, "indent")}><IndentIncrease className="h-4 w-4" /></ToolbarButton>

        <label className="flex h-8 items-center gap-1 rounded-lg border border-[#E8E4DC] bg-white px-2 text-xs text-[#7A766E]">
          Satır
          <input
            type="number"
            min={1}
            max={2.4}
            step={0.05}
            value={style.lineHeight ?? 1.55}
            onChange={(event) => applyStyle({ lineHeight: Number(event.target.value) })}
            className="w-14 bg-transparent text-[#2B2A28] outline-none"
          />
        </label>

        <label className="flex h-8 items-center gap-1 rounded-lg border border-[#E8E4DC] bg-white px-2 text-xs text-[#7A766E]">
          Harf
          <input
            type="number"
            min={0}
            max={3}
            step={0.1}
            value={style.letterSpacing ?? 0}
            onChange={(event) => applyStyle({ letterSpacing: Number(event.target.value) })}
            className="w-12 bg-transparent text-[#2B2A28] outline-none"
          />
        </label>

        <ToolbarButton title="Büyük/küçük harf" active={style.textTransform === "uppercase"} onClick={() => applyStyle({ textTransform: style.textTransform === "uppercase" ? "none" : "uppercase" })}><CaseSensitive className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Biçimlendirmeyi temizle" onClick={clearFormatting}><Eraser className="h-4 w-4" /></ToolbarButton>
      </div>
    </div>
  );
}
