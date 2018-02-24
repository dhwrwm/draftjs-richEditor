import React, { Component } from 'react';
import './RichEditor.css';
import classNames from 'classnames';
import BlockStyleControls from './BlockStyleControls';
import InlineStyleControls from './InlineStyleControls';
import { isUndefined } from 'lodash';
import Link from './Link';
import { Editor, EditorState, ContentState, RichUtils, CompositeDecorator } from 'draft-js';
import { Popover, PopoverContent } from 'reactstrap';

const uniqueId = () => Math.random().toString(36).substr(2, 16);

const styles = {
  popOverLabel: {
    fontSize: 13,
    marginRight: 10
  },

  popOverInput: {
    padding: 5,
    fontSize: 13,
    borderRadius: 2,
    marginRight: 5
  },

  popOverButton: {
    backgroundColor: "#6dabe4",
    padding: "6px 15px",
    borderRadius: 2,
    vertialAlign: "none",
    border: 0
  }
};

class RichEditor extends Component {

  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link
      }
    ]);

    let editorState = EditorState.createEmpty(decorator);

    if (!isUndefined(props.setEditorState)) {
      editorState = EditorState.set(props.setEditorState(), { decorator: decorator });
    }

    this.state = {
      editorState,
      urlValue: '',
      showURLInput: false,
      editorUniqueId: uniqueId()
    };

    this.focus = this.focus.bind(this);
    this.onTab = event => this._onTab(event);
    this.onChange = this.onChange.bind(this);
    this.editorRef = this.editorRef.bind(this);
    this.toggleBlockType = type => this._toggleBlockType(type);
    this.toggleInlineStyle = style => this._toggleInlineStyle(style);
    this.handleKeyCommand = command => this._handleKeyCommand(command);

    this.onURLChange = event => this.setState({ urlValue: event.target.value });
    this.onLinkInputKeyDown = this._onLinkInputKeydown(this);
    this.confirmLink = this._confirmLink.bind(this);
    this.promptForLink = this._promptForLink.bind(this);
    this.urlRef = this.urlRef.bind(this);
  }

  componentDidMount() {
    const { autoFocus } = this.props;

    if (! isUndefined(autoFocus) && autoFocus) {
      this.editor.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.resetEditorState) {
      const editorState = EditorState.push(
        this.state.editorState,
        ContentState.createFromText('')
      );

      this.setState({ editorState });
    }

    if (
      nextProps.updateEditorState &&
        !isUndefined(this.props.setEditorState)
    ) {
      const decorator = new CompositeDecorator([
        {
          strategy: findLinkEntities,
          component: Link
        }
      ]);

      const editorState = EditorState.set(
        this.props.setEditorState(),
        { decorator: decorator }
      );

      this.setState({ editorState });
    }

    if (nextProps.imagePreviewUrl)
      this.editor.focus();
  }

  _confirmLink(event) {
    event.preventDefault();

    const { editorState, urlValue } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      {
        url: urlValue,
        target: '_blank'
      }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity }
    );

    this.setState({
      editorState: RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      ),
      showURLInput: false,
      urlValue: ''
    }, () => {
      setTimeout(() => this.editor.focus(), 0);
    });
  }

  _onLinkInputKeydown(event) {
    if (event.which === 13) {
      this._confirmLink(event);
    }
  }

  _promptForLink() {
    const { editorState } = this.state;
    const selection = editorState.getSelection();

    if (! selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let url = '';

      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);

        url = linkInstance.getData().url;
      }

      this.setState({
        showURLInput: true,
        urlValue: url
      },
      () => {
        setTimeout(() => this.urlElement.focus(), 0);
      });
    }
  }

  urlRef(element) {
    this.urlElement = element;
  }

  editorRef(element) {
    this.editor = element;
  }

  focus() {
    this.editor.focus();
  }

  onChange(editorState) {
    this.setState({ editorState });

    if (! isUndefined(this.props.getEditorState)) {
      this.props.getEditorState(editorState);
    }
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);

      return true;
    }

    return false;
  }

  _onTab(event) {
    const maxDepth = 4;

    this.onChange(RichUtils.onTab(event, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    const { editorState } = this.state;
    const newState = RichUtils.toggleBlockType(editorState, blockType);

    this.onChange(newState);
  }

  _toggleInlineStyle(inlineStyle) {
    const { editorState } = this.state;
    const newState = RichUtils.toggleInlineStyle(editorState, inlineStyle);

    this.onChange(newState);
  }

  render() {
    const { editorState, editorUniqueId } = this.state;
    const contentState = editorState.getCurrentContent();
    const hasText = contentState.hasText();
    const type = contentState.getBlockMap().first().getType();
    const noTextEntered = (! hasText && ( type !== 'unstyled'));

    const editorClassName = classNames('richeditor-editor', {
      'richeditor-hidePlaceholder': noTextEntered
    });

    return (
      <div
        className="richeditor-root"
        role="toolbar"
        style={{overflow: "auto"}}
        aria-label="Rich editor controls">

        <div className="btn-toolbar richeditor-showControls">
          <InlineStyleControls
            inlineTypes={this.props.inlineTypes}
            editorState={editorState}
            editorUniqueId={editorUniqueId}
            onToggle={this.toggleInlineStyle}/>

          <BlockStyleControls
            editorUniqueId={editorUniqueId}
            editorState={editorState}
            onToggle={this.toggleBlockType}
            blockTypes={this.props.blockTypes}
            promptForLink={this.promptForLink}
            showURLInput={this.state.showURLInput}/>

          <Popover
            placement="bottom"
            isOpen={this.state.showURLInput}
            target={`Link-${editorUniqueId}`}
            toggle={this.promptForLink}>
            <PopoverContent>
              <form className="form-inline">
                <label
                  htmlFor="url-input"
                  style={styles.popOverLabel}>
                  Link
                </label>
                <input
                  style={styles.popOverInput}
                  onChange={this.onURLChange}
                  ref={this.urlRef}
                  type="url"
                  id="url-input"
                  className="form-control"
                  placeholder="Enter a link"
                  value={this.state.urlValue}
                  onKeyDown={this.onLinkInputKeyDown}/>
                <button
                  className="btn btn-primary"
                  onMouseDown={this.confirmLink}
                  disabled={this.state.urlValue.length === 0}
                  style={styles.popOverButton}>
                  <i className="fa fa-check"></i>
                </button>
              </form>
            </PopoverContent>
          </Popover>
        </div>

        <div className={editorClassName} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onTab={this.onTab}
            placeholder={this.props.placeholder ? this.props.placeholder : "What's on your mind?"}
            ref={this.editorRef}
            spellCheck/>
        </div>
      </div>
    );
  }
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  },
  STRIKETHROUGH: {
    textDecoration: 'line-through',
    color: "red"
  }
};

const getBlockStyle = (block) => {
  switch (block.getType()) {
  case 'blockquote': return 'richeditor-blockquote';
  case 'align-left': return 'richeditor-left-align-block';
  case 'align-center': return 'richeditor-center-align-block';
  case 'align-right': return 'richeditor-right-align-block';
  default: return null;
  }
};

const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();

      return (
        entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

export default RichEditor;
