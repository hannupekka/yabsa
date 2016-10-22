// @flow
import styles from 'styles/components/Loader';
import React from 'react';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import CSSModules from 'react-css-modules';

const Loader: Component<{}> = (): ElementType => {
  return <div styleName="spinner"></div>;
};

export default pure(CSSModules(Loader, styles));
