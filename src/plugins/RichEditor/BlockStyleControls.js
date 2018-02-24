import React from 'react';
import StyleButton from './StyleButton';

const BlockStyleControls = (props) => {
  const { editorState, editorUniqueId } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <span
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Inline style controls">
      {props.blockTypes.map(type =>
        <StyleButton
          key={type.label}
          editorUniqueId={editorUniqueId}
          active={type.style === blockType || ((type.style === 'LINK') && props.showURLInput)}
          label={type.label}
          icon={type.icon}
          onToggle={type.style === 'LINK' ? props.promptForLink : props.onToggle}
          style={type.style}/>
      )}
    </span>
  );
};

export default BlockStyleControls;
