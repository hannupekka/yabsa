// @flow
import styles from 'styles/components/Notification';
import React from 'react';
import { Map } from 'immutable';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import CSSModules from 'react-css-modules';

type Props = {
  data: Map<string, NotificationOptionsType>,
  onDismiss: (id: number) => ActionType
}

const Notification: Component<Props> = (props: Props): ElementType => {
  const onDismiss = (): void => {
    const { id, timeoutId } = props.data.toJS();
    clearTimeout(timeoutId);
    props.onDismiss(id);
  };

  const renderIcon = (): ?ElementType => {
    const icon = props.data.get('icon').toString();
    if (!icon) {
      return null;
    }

    return <i className={icon} aria-hidden="true" />;
  };

  const { title, body, type } = props.data.toJS();
  return (
    <div styleName={type} onClick={onDismiss}>
      <div styleName="left">
        <div styleName="icon">{renderIcon()}</div>
      </div>
      <div styleName="right">
        <div styleName="title">{title}</div>
        <div styleName="body">{body}</div>
      </div>
    </div>
  );
};

export default pure(CSSModules(Notification, styles));
