import { useEffect, useMemo, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon,
  Image as ImageIcon, Undo2, Redo2, Eraser,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Quote, Minus, Code, ChevronDown, Check
} from 'lucide-react';

// Dedicated FontSize Mark
const FontSizeMark = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[style*="font-size"]',
        getAttrs: (element: HTMLElement | string) => {
          if (typeof element === 'string') return false;
          return { fontSize: element.style.fontSize };
        },
      },
      {
        tag: '[style*="font-size"]',
        getAttrs: (element: HTMLElement | string) => {
          if (typeof element === 'string') return false;
          return { fontSize: element.style.fontSize };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) => {
          return chain().unsetMark(this.name).setMark(this.name, { fontSize: size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

// Dedicated FontFamily Mark
const FontFamilyMark = Mark.create({
  name: 'fontFamily',
  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontFamily || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontFamily) return {};
          return { style: `font-family: ${attributes.fontFamily}` };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[style*="font-family"]',
        getAttrs: (element: HTMLElement | string) => {
          if (typeof element === 'string') return false;
          return { fontFamily: element.style.fontFamily };
        },
      },
      {
        tag: '[style*="font-family"]',
        getAttrs: (element: HTMLElement | string) => {
          if (typeof element === 'string') return false;
          return { fontFamily: element.style.fontFamily };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setFontFamily:
        (font: string) =>
        ({ chain }: any) => {
          return chain().unsetMark(this.name).setMark(this.name, { fontFamily: font }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }: any) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

// Custom Highlight extension
const HighlightMark = Mark.create({
  name: 'highlight',
  addOptions() {
    return {
      color: '#fef08a',
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      color: {
        default: '#fef08a',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-color') || element.style.backgroundColor || '#fef08a',
        renderHTML: (attributes: any) => {
          if (!attributes.color) return {};
          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; border-radius: 2px; padding: 0.1em 0.25em;`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'mark' }, { tag: 'span[data-color]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setHighlight:
        (attributes?: { color?: string }) =>
        ({ commands }: any) =>
          commands.setMark(this.name, attributes),
      toggleHighlight:
        (attributes?: { color?: string }) =>
        ({ commands }: any) =>
          commands.toggleMark(this.name, attributes),
      unsetHighlight:
        () =>
        ({ commands }: any) =>
          commands.unsetMark(this.name),
    };
  },
});

// Custom Subscript extension
const SubscriptMark = Mark.create({
  name: 'subscript',
  parseHTML() {
    return [{ tag: 'sub' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['sub', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setSubscript:
        () =>
        ({ commands }: any) =>
          commands.setMark(this.name),
      toggleSubscript:
        () =>
        ({ commands }: any) =>
          commands.toggleMark(this.name),
      unsetSubscript:
        () =>
        ({ commands }: any) =>
          commands.unsetMark(this.name),
    };
  },
});

// Custom Superscript extension
const SuperscriptMark = Mark.create({
  name: 'superscript',
  parseHTML() {
    return [{ tag: 'sup' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setSuperscript:
        () =>
        ({ commands }: any) =>
          commands.setMark(this.name),
      toggleSuperscript:
        () =>
        ({ commands }: any) =>
          commands.toggleMark(this.name),
      unsetSuperscript:
        () =>
        ({ commands }: any) =>
          commands.unsetMark(this.name),
    };
  },
});

// Custom TextAlign extension
const TextAlign = Extension.create({
  name: 'textAlign',
  addOptions() {
    return {
      types: ['heading', 'paragraph', 'blockquote'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.textAlign || null,
            renderHTML: (attributes: any) => {
              if (!attributes.textAlign || attributes.textAlign === 'left') return {};
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextAlign:
        (alignment: string) =>
        ({ commands }: any) => {
          return this.options.types.some((type: string) =>
            commands.updateAttributes(type, { textAlign: alignment })
          );
        },
      unsetTextAlign:
        () =>
        ({ commands }: any) => {
          return this.options.types.some((type: string) =>
            commands.updateAttributes(type, { textAlign: null })
          );
        },
    };
  },
});

interface RichTextEditorProps {
  value?: string;
  content?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const FONT_FAMILIES = [
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif', fontStyle: '"Times New Roman", Times, serif' },
  { label: 'Georgia', value: 'Georgia, "Playfair Display", Lora, serif', fontStyle: 'Georgia, "Playfair Display", serif' },
  { label: 'Algebra', value: 'Cinzel, Algerian, serif', fontStyle: 'Cinzel, Algerian, serif' },
  { label: 'Cursive', value: '"Dancing Script", "Great Vibes", Caveat, cursive', fontStyle: '"Dancing Script", "Great Vibes", cursive' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif', fontStyle: 'Arial, sans-serif' },
  { label: 'Mono', value: 'ui-monospace, monospace', fontStyle: 'ui-monospace, monospace' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
];

function decodeHtmlEntities(raw: string): string {
  if (!raw) return '';
  if (raw.includes('&lt;') && raw.includes('&gt;')) {
    try {
      const doc = new DOMParser().parseFromString(raw, 'text/html');
      return doc.documentElement.textContent || raw;
    } catch {
      return raw;
    }
  }
  return raw;
}

function ToolbarButton({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition cursor-pointer ${
        active ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, content, onChange, placeholder, minHeight = 220 }: RichTextEditorProps) {
  const incomingRaw = value !== undefined ? value : content !== undefined ? content : '';
  const parsedContent = useMemo(() => decodeHtmlEntities(incomingRaw), [incomingRaw]);
  const [highlightColor, setHighlightColor] = useState('#fef08a');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const isLocalChange = useRef(false);

  // Dynamically load Google Fonts into document head to guarantee font availability across all OS/browsers
  useEffect(() => {
    const linkId = 'google-fonts-tiptap';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cinzel:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      TextStyle,
      Color,
      Underline,
      FontSizeMark,
      FontFamilyMark,
      HighlightMark,
      SubscriptMark,
      SuperscriptMark,
      TextAlign,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder || 'Write something...' }),
    ],
    content: parsedContent,
    onUpdate: ({ editor: ed }) => {
      isLocalChange.current = true;
      onChange(ed.getHTML());
    },
  });

  // Keep the editor in sync when the value changes externally (e.g. loading edit data)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    if (editor.isFocused) return; // Do not overwrite when user is typing

    const currentHtml = editor.getHTML();
    if (parsedContent !== currentHtml) {
      const normInput = parsedContent.trim().replace(/\s+/g, ' ');
      const normCurrent = currentHtml.trim().replace(/\s+/g, ' ');
      if (normInput !== normCurrent) {
        editor.commands.setContent(parsedContent || '', { emitUpdate: false });
      }
    }
  }, [parsedContent, editor]);

  if (!editor) return null;

  const handleFontFamilyChange = (val: string) => {
    if (!editor) return;
    if (!val || val === FONT_FAMILIES[0].value) {
      (editor.chain().focus() as any).unsetMark('fontFamily').run();
      return;
    }

    if (editor.state.selection.empty) {
      const { $from } = editor.state.selection;
      if ($from.parent.textContent.length > 0) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: $from.start(), to: $from.end() })
          .unsetMark('fontFamily')
          .setMark('fontFamily', { fontFamily: val })
          .run();
      } else {
        (editor.chain().focus() as any).unsetMark('fontFamily').setMark('fontFamily', { fontFamily: val }).run();
      }
    } else {
      (editor.chain().focus() as any).unsetMark('fontFamily').setMark('fontFamily', { fontFamily: val }).run();
    }
  };

  const handleFontSizeChange = (val: string) => {
    if (!editor) return;
    if (!val) {
      (editor.chain().focus() as any).unsetMark('fontSize').run();
      return;
    }

    if (editor.state.selection.empty) {
      const { $from } = editor.state.selection;
      if ($from.parent.textContent.length > 0) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: $from.start(), to: $from.end() })
          .unsetMark('fontSize')
          .setMark('fontSize', { fontSize: val })
          .run();
      } else {
        (editor.chain().focus() as any).unsetMark('fontSize').setMark('fontSize', { fontSize: val }).run();
      }
    } else {
      (editor.chain().focus() as any).unsetMark('fontSize').setMark('fontSize', { fontSize: val }).run();
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const activeFontFamily = editor.getAttributes('fontFamily').fontFamily || '';
  const activeFontSize = editor.getAttributes('fontSize').fontSize || '';

  const isFontActive = (f: (typeof FONT_FAMILIES)[0]) => {
    if (!activeFontFamily) return f.label === 'Times New Roman';
    const normActive = activeFontFamily.toLowerCase().replace(/['"]/g, '');
    const normVal = f.value.toLowerCase().replace(/['"]/g, '');
    const normLabel = f.label.toLowerCase();
    return normActive.includes(normLabel) || normActive === normVal;
  };

  const currentFontObj = FONT_FAMILIES.find((f) => isFontActive(f)) || FONT_FAMILIES[0];

  return (
    <div className="border border-foreground/10 rounded-xl overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-foreground/10 bg-muted/20">
        {/* Font family dropdown popover */}
        <div className="relative inline-block" ref={fontMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="h-7 px-2.5 text-xs bg-muted/40 border border-foreground/10 rounded-md text-foreground cursor-pointer focus:outline-none flex items-center gap-1.5 hover:bg-muted/70 transition"
            title="Font family"
          >
            <span style={{ fontFamily: currentFontObj.fontStyle }}>{currentFontObj.label}</span>
            <ChevronDown size={12} className="text-muted-foreground" />
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[150px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 space-y-0.5 max-h-60 overflow-y-auto">
              {FONT_FAMILIES.map((f) => {
                const active = isFontActive(f);
                return (
                  <button
                    key={f.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleFontFamilyChange(f.value);
                      setShowFontMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs rounded-md cursor-pointer transition flex items-center justify-between min-h-[28px] leading-snug ${
                      active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="leading-snug text-xs truncate" style={{ fontFamily: f.fontStyle }}>
                      {f.label}
                    </span>
                    {active && <Check size={12} className="shrink-0 ml-1.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Font size dropdown popover */}
        <div className="relative inline-block" ref={sizeMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="h-7 px-2 text-xs bg-muted/40 border border-foreground/10 rounded-md text-foreground cursor-pointer focus:outline-none flex items-center gap-1 hover:bg-muted/70 transition"
            title="Font size"
          >
            <span>{activeFontSize || 'Size'}</span>
            <ChevronDown size={12} className="text-muted-foreground" />
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 space-y-0.5 max-h-60 overflow-y-auto">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleFontSizeChange('');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Default
              </button>
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleFontSizeChange(s);
                    setShowSizeMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-xs rounded-md cursor-pointer transition flex items-center justify-between ${
                    activeFontSize === s ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{s}</span>
                  {activeFontSize === s && <Check size={12} className="shrink-0 ml-1 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text color */}
        <input
          type="color"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 w-7 border border-foreground/10 rounded-md bg-transparent cursor-pointer"
          title="Text color"
        />

        {/* Highlighter */}
        <div className="relative inline-flex items-center">
          <ToolbarButton
            title="Highlight text"
            active={editor.isActive('highlight')}
            onClick={() => {
              if (editor.isActive('highlight')) {
                (editor.chain().focus() as any).unsetHighlight().run();
              } else {
                (editor.chain().focus() as any).setHighlight({ color: highlightColor }).run();
              }
            }}
          >
            <Highlighter size={15} style={{ color: editor.isActive('highlight') ? editor.getAttributes('highlight').color || '#eab308' : undefined }} />
          </ToolbarButton>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowHighlightMenu(!showHighlightMenu)}
            title="Highlight color palette"
            className="p-1 text-muted-foreground hover:bg-foreground/5 rounded-sm cursor-pointer"
          >
            <ChevronDown size={11} />
          </button>
          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-md p-1.5 flex items-center gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setHighlightColor(c.value);
                    (editor.chain().focus() as any).setHighlight({ color: c.value }).run();
                    setShowHighlightMenu(false);
                  }}
                  className="w-5 h-5 rounded-full border border-black/10 transition hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                title="Remove highlight"
                onClick={() => {
                  (editor.chain().focus() as any).unsetHighlight().run();
                  setShowHighlightMenu(false);
                }}
                className="px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Text formatting */}
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton title="Subscript" active={editor.isActive('subscript')} onClick={() => (editor.chain().focus() as any).toggleSubscript().run()}>
          <SubscriptIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Superscript" active={editor.isActive('superscript')} onClick={() => (editor.chain().focus() as any).toggleSuperscript().run()}>
          <SuperscriptIcon size={15} />
        </ToolbarButton>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Justify"
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()}
        >
          <AlignJustify size={15} />
        </ToolbarButton>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Headings */}
        <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Lists & Blocks */}
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={15} />
        </ToolbarButton>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Links & Media */}
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={addImage}>
          <ImageIcon size={15} />
        </ToolbarButton>

        <div className="w-px h-6 bg-foreground/10 mx-1" />

        {/* Formatting Actions */}
        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser size={15} />
        </ToolbarButton>
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none text-foreground"
        style={{ minHeight }}
      />
      <style>{`
        .tiptap { min-height: ${minHeight}px; padding: 14px 18px; outline: none; font-family: 'Times New Roman', Times, serif; }
        .tiptap p { margin: 0.4em 0; line-height: 1.6; }
        .tiptap h1 { font-size: 1.8rem; font-weight: 800; margin: 0.6em 0 0.3em; line-height: 1.3; }
        .tiptap h2 { font-size: 1.45rem; font-weight: 700; margin: 0.6em 0 0.3em; line-height: 1.35; }
        .tiptap h3 { font-size: 1.2rem; font-weight: 700; margin: 0.5em 0 0.25em; line-height: 1.4; }
        .tiptap ul, .tiptap ol { padding-left: 1.6em; margin: 0.5em 0; }
        .tiptap ul { list-style-type: disc; }
        .tiptap ol { list-style-type: decimal; }
        .tiptap li { margin: 0.25em 0; line-height: 1.5; }
        .tiptap li p { margin: 0; }
        .tiptap a { color: var(--secondary, #6366f1); text-decoration: underline; cursor: pointer; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5em 0; }
        .tiptap blockquote { border-left: 3px solid var(--secondary, #6366f1); padding-left: 0.8em; margin: 0.5em 0; font-style: italic; opacity: 0.85; }
        .tiptap hr { border: none; border-top: 2px solid var(--foreground, #ccc); margin: 1em 0; opacity: 0.3; }
        .tiptap pre { background: var(--muted, #f1f5f9); padding: 0.75em 1em; border-radius: 6px; font-family: monospace; font-size: 0.875rem; margin: 0.5em 0; overflow-x: auto; }
        .tiptap mark { border-radius: 3px; padding: 0.1em 0.25em; }
        .tiptap sub { font-size: 0.75em; vertical-align: sub; }
        .tiptap sup { font-size: 0.75em; vertical-align: super; }
        .tiptap [style*="text-align: left"] { text-align: left !important; }
        .tiptap [style*="text-align: center"] { text-align: center !important; }
        .tiptap [style*="text-align: right"] { text-align: right !important; }
        .tiptap [style*="text-align: justify"] { text-align: justify !important; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground, #888);
          float: left; height: 0; pointer-events: none;
        }
      `}</style>
    </div>
  );
}
