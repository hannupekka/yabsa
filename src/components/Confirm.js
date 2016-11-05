// @flow
import styles from 'styles/components/Confirm';
import React from 'react';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import CSSModules from 'react-css-modules';

type Props = {
  isVisible: bool,
  onConfirm: Function,
  onCancel: Function
}

const Confirm: Component<Props> = (props: Props): ?ElementType => {
  return props.isVisible ? (
    <div styleName="wrapper">
      <div styleName="content">
        <div styleName="text">Are you sure you want to delete this bill?</div>
        <button styleName="button" onClick={props.onConfirm}>
          <i className="fa fa-check" aria-hidden="true" />
          Yes, delete it!
        </button>
        <button styleName="button" onClick={props.onCancel}>
          <i className="fa fa-ban" aria-hidden="true" />
          No, cancel!
        </button>
      </div>
    </div>
  ) : null;
};

export default pure(CSSModules(Confirm, styles));
