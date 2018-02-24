import React from 'react';
import StyleButton from './StyleButton';

const InlineStyleControls = (props) => {
  const { editorState, editorUniqueId } = props;
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <span
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Inline style controls">
      {props.inlineTypes.map(type =>
        <StyleButton
          key={type.label}
          editorUniqueId={editorUniqueId}
          active={currentStyle.has(type.style)}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}/>
      )}
    </span>
  );
};

export default InlineStyleControls;
