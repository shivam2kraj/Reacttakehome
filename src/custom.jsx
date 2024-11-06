import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
// import "draft-js/dist/Draft.css";

// Custom inline style map to support 'RED' text color
const styleMap = {
  RED: {
    color: "red",
  },
};

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      );
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars) => {
    if (chars !== " ") return "not-handled"; // Only apply formatting on space

    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const text = block.getText();

    if (text.startsWith("#")) {
      // Apply Heading style
      setEditorState(applyBlockStyle(editorState, "header-one", text.slice(1)));
      return "handled";
    } else if (text.startsWith("*") && !text.startsWith("**")) {
      // Apply Bold style
      setEditorState(applyInlineStyle(editorState, "BOLD", text.slice(1)));
      return "handled";
    } else if (text.startsWith("**") && !text.startsWith("***")) {
      // Apply Red color
      setEditorState(applyInlineStyle(editorState, "RED", text.slice(2)));
      return "handled";
    } else if (text.startsWith("***")) {
      // Apply Underline
      setEditorState(applyInlineStyle(editorState, "UNDERLINE", text.slice(3)));
      return "handled";
    }

    return "not-handled";
  };

  // Helper function to apply block styles like headings
  const applyBlockStyle = (editorState, blockType, newText) => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // Remove the symbol and update the text
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: selectionState.getEndOffset(),
      }),
      newText
    );

    // Apply the block style
    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "remove-range"
    );
    newEditorState = RichUtils.toggleBlockType(newEditorState, blockType);
    return newEditorState;
  };

  // Helper function to apply inline styles like Bold, Red, or Underline
  const applyInlineStyle = (editorState, style, newText) => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // Remove the symbol and update the text
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: selectionState.getEndOffset(),
      }),
      newText
    );

    // Apply the inline style
    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-inline-style"
    );
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
    return newEditorState;
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", rawContent);
    alert("Content saved to localStorage!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Demo editor by {"<Name>"}</h1>
      <button onClick={handleSave} style={{ marginBottom: "10px" }}>
        Save
      </button>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "200px",
        }}
      >
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={(chars) => handleBeforeInput(chars)}
          onChange={setEditorState}
          customStyleMap={styleMap} // Apply the custom style map for RED
        />
      </div>
    </div>
  );
};

export default CustomEditor;
