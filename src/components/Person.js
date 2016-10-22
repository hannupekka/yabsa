// @flow
import styles from 'styles/components/Person';
import React from 'react';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import sumBy from 'lodash/sumby';
import filter from 'lodash/filter';
import round from 'lodash/round';
import CSSModules from 'react-css-modules';

type Props = {
  id: string,
  name: string,
  amount: string,
  isLastPerson: bool,
  onAddPerson: Function,
  onUpdateName: Function,
  onUpdateAmount: Function
}

const Person: Component<Props> = (props: Props): ElementType => {
  const onUpdateName = (e: Object): void => {
    const value = e.target.value;
    props.onUpdateName(props.id, value);
  };

  const onUpdateAmount = (e: Object): void => {
    const value = e.target.value;

    if (value === '' || value.match(/^[0-9., ]+$/)) {
      props.onUpdateAmount(props.id, value.replace(/,/g, '.'));
    }
  };

  const onKeyDown = (e: Object): void => {
    if (e.key === 'Tab' && props.isLastPerson) {
      props.onAddPerson();
    }
  };

  const sumAmount = (): number => {
    if (props.amount.length === 0) {
      return 0;
    }

    const amounts = filter(props.amount.split(' '), amount => parseInt(amount, 10));
    return round(sumBy(amounts, amount => Number(amount)), 2);
  };

  return (
    <div styleName="person">
      <input
        type="text"
        placeholder="John Doe"
        styleName="input"
        value={props.name}
        onChange={onUpdateName}
      />
      <input
        type="text"
        placeholder="0"
        styleName="input"
        value={props.amount}
        onChange={onUpdateAmount}
        onKeyDown={onKeyDown}
      />
      <span styleName="total">{sumAmount()} EUR</span>
    </div>
  );
};

export default pure(CSSModules(Person, styles));
