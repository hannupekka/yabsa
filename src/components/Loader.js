// @flow
import styles from 'styles/components/Loader';
import React from 'react';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import CSSModules from 'react-css-modules';

type Props = {
  requestCount: number
}

const Loader: Component<Props> = (props: Props): ElementType => {
  return (
    <div
      id="loader"
      styleName={props.requestCount === 0 ? 'spinner' : 'spinner--visible'}
    />
  );
};

export default pure(CSSModules(Loader, styles));
