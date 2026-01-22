/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isTextNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type DOMExportOutputMap,
  isHTMLElement,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  ParagraphNode,
  TextNode,
} from "lexical";
import { useEffect, useRef } from "react";

import ExampleTheme from "./ExampleTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import "./styles.css";
import { parseAllowedColor, parseAllowedFontSize } from "./styleConfig";

const placeholder = "Enter some rich text...";

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll("[style],[class]"),
    ]) {
      el.removeAttribute("class");
      el.removeAttribute("style");
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = "";
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== "" && fontSize !== "15px") {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== "" && backgroundColor !== "rgb(255, 255, 255)") {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== "" && color !== "rgb(0, 0, 0)") {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: "React.js Demo",
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
};

interface LexicalComponentProps {
  value?: string;
  onChange?: (value: string) => void;
}

function InitialValuePlugin({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    if (value !== undefined && value !== null) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, "text/html");
        const root = $getRoot();
        root.clear();

        // Criar nodes manualmente para cada elemento HTML
        for (const child of Array.from(dom.body.children)) {
          const textContent = child.textContent || "";

          // Criar parágrafo com texto
          const textNode = $createTextNode(textContent);
          const paragraphNode = $createParagraphNode();
          paragraphNode.append(textNode);
          root.append(paragraphNode);
        }
      });

      // Dispara onChange para sincronizar com o form
      if (onChange) {
        onChange(value);
      }
    }
  }, [value, editor, onChange]);

  return null;
}

export default function LexicalComponent({
  value,
  onChange,
}: LexicalComponentProps) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin onChange={onChange} />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={placeholder}
                className="editor-input"
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <InitialValuePlugin onChange={onChange} value={value} />
        </div>
      </div>
    </LexicalComposer>
  );
}
