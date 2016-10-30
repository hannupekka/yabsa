// @flow
import styles from 'styles/components/Header';
import React from 'react';
import { pure } from 'recompose';
import { Link } from 'react-router';
import type { Component } from 'recompose';
import CSSModules from 'react-css-modules';

const Header: Component<{}> = (): ElementType => {
  return (
    <header styleName="header">
      <Link to="/" styleName="title">YABSA</Link>
    </header>
  );
};

export default pure(CSSModules(Header, styles));
