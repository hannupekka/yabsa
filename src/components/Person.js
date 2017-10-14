// @flow
import styles from 'styles/components/Person';
import React from 'react';
import { onlyUpdateForKeys } from 'recompose';
import type { Component } from 'recompose';
import { sumBy, filter, round } from 'lodash';
import CSSModules from 'react-css-modules';

type Props = {
  id: string,
  name: string,
  amount: string,
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
    const matches = value.match(/^$|^((\d+[,.]?\d*) ?)+/g);

    if (matches) {
      const sanitizedValue = matches[0].replace(/,/g, '.');
      props.onUpdateAmount(props.id, sanitizedValue);
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Tab' && props.isLastPerson) {
      // Prevent tab skipping over autofocused name field.
      e.preventDefault();
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
    const { name, hasMultiplePersons } = props;

    if (!hasMultiplePersons) {
      return null;
    }

    return (
      <button
        className="person__delete"
        styleName="deletePerson"
        title={`Remove ${name}`}
        tabIndex="-1"
        onClick={onDeletePerson}
      >
        <i className="fa fa-trash" aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="person" styleName="person">
      <input
        type="text"
        placeholder="Name"
        className="person__name"
        styleName={props.name === '' ? 'input--invalid' : 'input'}
        value={props.name}
        onChange={onUpdateName}
        autoFocus
      />
      <input
        type="text"
        placeholder="Paid amount"
        className="person__amount"
        styleName="input"
        value={props.amount}
        onChange={onUpdateAmount}
        onKeyDown={onKeyDown}
      />
      <div className="person__total" styleName="total">
        {sumAmount()} EUR
        {renderDeleteButton()}
      </div>
    </div>
  );
};

export default
  onlyUpdateForKeys(['name', 'amount', 'hasMultiplePersons'])(CSSModules(Person, styles));
