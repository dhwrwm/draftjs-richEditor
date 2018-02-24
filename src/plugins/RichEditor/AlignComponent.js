import React, { Component } from 'react';

class AlignComp extends Component {
  render() {
    console.log("Here")
    return (
      <div style={{ backgroundColor: "red"}}>
        {/* here, this.props.children contains a <section> container, as that was the matching element */}
        {this.props.children}
      </div>
    );
  }
}

export default AlignComp;