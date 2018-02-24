import React, { Component } from 'react';
import classNames from 'classnames';

class StyleButton extends Component {

  constructor(props) {
    super(props);

    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(event) {
    event.preventDefault();

    this.props.onToggle(this.props.style);
  }

  render() {
    const { icon, active, label, editorUniqueId } = this.props;
    const wrapperClassName = classNames('btn', 'btn-secondary', {
      'active': active
    });

    const iconClassName = classNames('fa', icon);

    return (
      <span
        id={`${label}-${editorUniqueId}`}
        className={wrapperClassName}
        onMouseDown={this.onToggle}>
        <i className={iconClassName}></i>
      </span>
    );
  }
}

export default StyleButton;
