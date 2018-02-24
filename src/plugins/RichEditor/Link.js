import React from 'react';

const styles = {
  link: {
    color: '#ff5000'
  }
};

const Link = ({ entityKey, children, contentState }) => {
  const { url } = contentState.getEntity(entityKey).getData();

  return (
    <a href={url} style={styles.link}>{children}</a>
  );
};

export default Link;
