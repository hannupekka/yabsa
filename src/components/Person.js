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
  isFirstPerson: bool,
  isLastPerson: bool,
  hasMultiplePersons: bool,
  onAddPerson: Function,
  onDeletePerson: Function,
  onUpdateName: Function,
  onUpdateAmount: Function
}

const Person: Component<Props> = (props: Props): ElementType => {
  const onDeletePerson = (): void => {
    props.onDeletePerson(props.id);
  };

  const onUpdateName = (e: DOMEvent): void => {
    const value = e.target.value;
    props.onUpdateName(props.id, value);
  };

  const onUpdateAmount = (e: DOMEvent): void => {
    const value = e.target.value;

    if (value.match(/^[0-9., ]*$/)) {
      const sanitizedValue =
        value
        .replace(/,/g, '.')
        .replace(/\.+/g, '.')
        .replace(/ +/g, ' ')
        .replace(/^ /, '');
      props.onUpdateAmount(props.id, sanitizedValue);
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Tab' && props.isLastPerson) {
      props.onAddPerson();
    }
  };

  const sumAmount = (): number => {
    if (props.amount.length === 0) {
      return 0;
    }

    const amounts = filter(props.amount.split(' '), amount => parseFloat(amount));

    return round(sumBy(amounts, amount => Number(amount)), 2);
  };

  const renderDeleteButton = (): ?ElementType => {
    const { hasMultiplePersons } = props;

    if (!hasMultiplePersons) {
      return null;
    }

    return (
      <button styleName="deletePerson" tabIndex="-1" onClick={onDeletePerson}>
        <i className="fa fa-trash" aria-hidden="true" />
      </button>
    );
  };

  return (
    <div styleName="person">
      {renderDeleteButton()}
      <input
        type="text"
        placeholder="John Doe"
        styleName="input"
        value={props.name}
        autoFocus={props.isFirstPerson}
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
