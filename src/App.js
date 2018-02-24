import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import RichEditor from './plugins/RichEditor';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Parser from 'html-react-parser';

const blockTypes = [
  { label: 'Blockquote', style: 'blockquote', icon: 'fa-quote-right' },
  { label: 'code-block', style: 'code-block', icon: 'fa-code'},
  { label: 'align-left', style: 'align-left', icon: 'fa-align-left'},
  { label: 'align-center', style: 'align-center', icon: 'fa-align-center'},
  { label: 'align-right', style: 'align-right', icon: 'fa-align-right'}
];

const inlineTypes = [
  { label: 'Bold', style: 'BOLD', icon: 'fa-bold'},
  { label: 'Italic', style: 'ITALIC', icon: 'fa-italic' },
  { label: 'Underline', style: 'UNDERLINE', icon: 'fa-underline' },
  { label: 'Strikethrough', style: 'STRIKETHROUGH', icon: 'fa-strikethrough' }
];

const styles = {
  editorWrapper: {
    border: "1px solid rgba(0, 0, 0, 0.15)",
    padding: ".5rem .5rem",
    borderRadius: 4,
  },
  withError: {
    border: "1px solid #d9534f",
    padding: ".5rem .5rem",
    borderRadius: 4,
  },
  addListItemGroup: {
    position: "absolute",
    right: 10,
    fontSize: ".8rem"
  },
  errorText: {
    fontSize: 14,
    color: '#d9534f'
  },
  cardWrapper: { marginBottom: 15 }
};

const optionForHTMLExport = {
  inlineStyles:{
    STRIKETHROUGH: {
      style:{
        textDecoration: 'line-through',
        color: "red"
      }
    },
  },
  blockRenderers:{
    'align-left': (block) => {
      let data = block.getData();
      console.log("The block is", block.getText());
      return '<div className="left-align-block">' + block.getText() + '</div>';
    },
    'align-center': (block) => {
      let data = block.getData();
      console.log("The block is", block.getText());
      return '<div className="center-align-block">' + block.getText() + '</div>';
    },
    'align-right': (block) => {
      let data = block.getData();
      console.log("The block is", block.getText());
      return '<div className="right-align-block">' + block.getText() + '</div>';
    }
  }
}


class App extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      resetEditorState: false,
      updateEditorState: false,
      editorState: EditorState.createEmpty(),
      parseText: '',
    };

    this.setEditorState = this.setEditorState.bind(this);
    this.getEditorState = editorState => this._getEditorState(editorState);
  }

  setEditorState() {
    return this.state.editorState;
  }

  _getEditorState(editorState) {
    const currentContent = editorState.getCurrentContent();
    const parseText = stateToHTML(currentContent, optionForHTMLExport);
    this.setState({ editorState, parseText });
  }

  render() {
    const { resetEditorState, updateEditorState, parseText, editorState } = this.state;
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    // console.log("The current inline style is", currentInlineStyle.toJS());
    return (
      <div className="App">
        <h2>My Wziwig editor:</h2>
        <div style={styles.editorWrapper}>
          <RichEditor
            resetEditorState={resetEditorState}
            updateEditorState={updateEditorState}
            blockTypes={blockTypes}
            inlineTypes={inlineTypes}
            placeholder="Enter text..."
            setEditorState={this.setEditorState}
            getEditorState={this.getEditorState}/>
        </div>
        <hr/>
        <h2>The output html is -</h2>
        {parseText}

        <h2>And the parsed one is -</h2>
        {Parser(parseText)}
      </div>
    );
  }
}

export default App;
