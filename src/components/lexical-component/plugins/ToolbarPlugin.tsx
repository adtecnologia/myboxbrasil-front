/** biome-ignore-all lint/a11y/useButtonType: ignorar */
/** biome-ignore-all lint/complexity/noForEach: ignorar */
/** biome-ignore-all lint/performance/useTopLevelRegex: ignorar */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

interface ToolbarPluginProps {
  onChange?: (value: string) => void;
}

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin({ onChange }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  // ------------- FONT SIZE CONTROLS -------------
  const applyFontSize = (size) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          // @ts-expect-error
          if (node.setStyle) {
            // @ts-expect-error
            node.setStyle(`font-size: ${size}px;`);
          }
        });
      }
    });
  };

  const increaseFont = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0];
        // @ts-expect-error
        const match = node?.getStyle()?.match(/font-size:\s*(\d+)px/);
        const current = match ? Number(match[1]) : 15;
        applyFontSize(current + 1);
      }
    });
  };

  const decreaseFont = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0];
        // @ts-expect-error
        const match = node?.getStyle()?.match(/font-size:\s*(\d+)px/);
        const current = match ? Number(match[1]) : 15;
        applyFontSize(Math.max(8, current - 1));
      }
    });
  };
  // ----------------------------------------------

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            $updateToolbar();
            if (onChange) {
              const element = editor.getRootElement();
              if (element) {
                onChange(element.innerHTML);
              }
            }
          });
        }),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            $updateToolbar();
            return false;
          },
          COMMAND_PRIORITY_LOW
        ),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          (payload) => {
            setCanUndo(payload);
            return false;
          },
          COMMAND_PRIORITY_LOW
        ),
        editor.registerCommand(
          CAN_REDO_COMMAND,
          (payload) => {
            setCanRedo(payload);
            return false;
          },
          COMMAND_PRIORITY_LOW
        )
      ),
    [editor, $updateToolbar]
  );

  return (
    <div className="toolbar" ref={toolbarRef}>
      {/* Undo / Redo */}
      <button
        aria-label="Undo"
        className="toolbar-item spaced"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        type="button"
      >
        <i className="format undo" />
      </button>

      <button
        aria-label="Redo"
        className="toolbar-item"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        type="button"
      >
        <i className="format redo" />
      </button>

      <Divider />

      {/* Bold / Italic / Underline / Strike */}
      <button
        aria-label="Format Bold"
        className={`toolbar-item spaced${isBold ? "active" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        type="button"
      >
        <i className="format bold" />
      </button>

      <button
        aria-label="Format Italics"
        className={`toolbar-item spaced${isItalic ? "active" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        type="button"
      >
        <i className="format italic" />
      </button>

      <button
        aria-label="Format Underline"
        className={`toolbar-item spaced${isUnderline ? "active" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        type="button"
      >
        <i className="format underline" />
      </button>

      <button
        aria-label="Format Strikethrough"
        className={`toolbar-item spaced${isStrikethrough ? "active" : ""}`}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        type="button"
      >
        <i className="format strikethrough" />
      </button>

      <Divider />

      {/* Alignment */}
      <button
        aria-label="Left Align"
        className="toolbar-item spaced"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        type="button"
      >
        <i className="format left-align" />
      </button>

      <button
        aria-label="Center Align"
        className="toolbar-item spaced"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        type="button"
      >
        <i className="format center-align" />
      </button>

      <button
        aria-label="Right Align"
        className="toolbar-item spaced"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        type="button"
      >
        <i className="format right-align" />
      </button>

      <button
        aria-label="Justify Align"
        className="toolbar-item"
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        type="button"
      >
        <i className="format justify-align" />
      </button>

      <Divider />

      {/* 🔥 FONT SIZE BUTTONS ADDED HERE */}
      <button
        aria-label="Decrease Font"
        className="toolbar-item spaced"
        onClick={decreaseFont}
        type="button"
      >
        <i className="format decrease-font" />
      </button>

      <button
        aria-label="Increase Font"
        className="toolbar-item spaced"
        onClick={increaseFont}
        type="button"
      >
        <i className="format increase-font" />
      </button>
    </div>
  );
}
