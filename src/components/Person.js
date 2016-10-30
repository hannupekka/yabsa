// @flow
import styles from 'styles/components/Person';
import React from 'react';
import { pure } from 'recompose';
import type { Component } from 'recompose';
import { sumBy, filter, round } from 'lodash';
import CSSModules from 'react-css-modules';

type Props = {
  id: string,
  name: string,
  amount: string,
  isFirstPerson: bool,
  isLastPerson: bool,
  hasMultiplePersons: bool,
  onAddPerson: () => ActionType,
  onDeletePerson: (id: string) => ActionType,
  onUpdateName: (id: string, value: string) => ActionType,
  onUpdateAmount: (id: string, value: string) => ActionType
}

const Person: Component<Props> = (props: Props): ElementType => {
  const onDeletePerson = (): void => {
    props.onDeletePerson(props.id);
  };

  const onUpdateName = (e: InputEvent): void => {
    const value = e.target.value;
    props.onUpdateName(props.id, value);
  };

  const onUpdateAmount = (e: InputEvent): void => {
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
      <input
        type="text"
        placeholder="Name"
        styleName="input"
        value={props.name}
        autoFocus={props.isFirstPerson}
        onChange={onUpdateName}
      />
      <input
        type="text"
        placeholder="Paid amount"
        styleName="input"
        value={props.amount}
        onChange={onUpdateAmount}
        onKeyDown={onKeyDown}
      />
      <div styleName="total">
        {sumAmount()} EUR
        {renderDeleteButton()}
      </div>
    </div>
  );
};

export default pure(CSSModules(Person, styles));
