// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import Person from 'components/Person';
import * as personActions from 'redux/modules/person';
import * as paymentActions from 'redux/modules/payment';
import shareExpenses from 'utils/payments';

type Props = {
  params: Object,
  persons: Map,
  isValid: bool,
  onAddPerson: Function,
  onDeletePerson: Function,
  onSetPayments: Function,
  onUpdateName: Function,
  onUpdateAmount: Function
};

// eslint-disable-next-line
class Index extends Component {
  props: Props;

  onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line
      console.log('Enter');
    }
  }

  onShareExpenses = (): void => {
    const { persons } = this.props;
    const payments = shareExpenses(persons);
    this.props.onSetPayments(
      payments.get('payments'),
      payments.get('share'),
      payments.get('totalAmount')
    );
  }

  renderPersons = (): ElementType => {
    const { persons } = this.props;

    return persons.toList().map((person, i) => {
      return (
        <Person
          key={person.get('id')}
          onAddPerson={this.props.onAddPerson}
          onDeletePerson={this.props.onDeletePerson}
          onUpdateName={this.props.onUpdateName}
          onUpdateAmount={this.props.onUpdateAmount}
          isFirstPerson={i === 0}
          isLastPerson={i === persons.size - 1}
          hasMultiplePersons={persons.size > 1}
          {...person.toJS()}
        />
      );
    }).toJS();
  }

  render() {
    const { isValid } = this.props;
    return (
      <div>
        <div styleName="persons" onKeyDown={this.onKeyDown}>
          {this.renderPersons()}
          <div styleName="help">
            Protip: you can enter multiple amounts for person by separating them by space!
          </div>
          <div styleName="actions">
            <button onClick={this.props.onAddPerson} styleName="addPerson">
              <i className="fa fa-user-plus" aria-hidden="true" />
              Add person
            </button>
            <button onClick={this.onShareExpenses} disabled={!isValid} styleName="shareExpenses">
              <i className="fa fa-calculator" aria-hidden="true" />
              Share expenses
            </button>
          </div>
        </div>
        <div styleName="payments">
        </div>
      </div>
    );
  }
}

const mapState = (state: StateType): StateType => ({
  persons: state.person.get('persons'),
  isValid: state.person.get('persons')
    .every(person => person.get('name') !== '' && person.get('amount') !== '')
});

const mapActions = (dispatch: Function): Object => ({
  onAddPerson: (): Function => dispatch(personActions.addPerson()),
  onDeletePerson: (id: string): Function => dispatch(personActions.deletePerson(id)),
  onSetPayments: (payments: Map, share: number, totalAmount: number): Function =>
    dispatch(paymentActions.setPayments(payments, share, totalAmount)),
  onUpdateName: (id: string, value: string) => dispatch(personActions.updateName(id, value)),
  onUpdateAmount: (id: string, value: string) => dispatch(personActions.updateAmount(id, value))
});

export default connect(
  mapState,
  mapActions
)(CSSModules(Index, styles));
