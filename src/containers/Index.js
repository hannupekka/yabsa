// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import round from 'lodash/round';
import Person from 'components/Person';
import * as personActions from 'redux/modules/person';
import * as paymentActions from 'redux/modules/payment';
import shareExpenses from 'utils/payments';

type Props = {
  params: Object,
  payments: Map,
  share: number,
  totalAmount: number,
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
    const { isValid } = this.props;
    if (e.key === 'Enter' && isValid) {
      this.onShareExpenses();
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

  renderPayments = (): ?ElementType => {
    const { payments, share, totalAmount } = this.props;

    if (payments.isEmpty()) {
      return null;
    }

    const paymentList = payments.map((payment, id) => {
      return (
        <div key={id} styleName="payment">
          <b>{payment.get('from')}</b> pays:
          <div styleName="to">
            {
              payment.get('to').map((to, i) => {
                return (
                  <div key={i} styleName="target">
                    {round(to.get('amount'), 2)} EUR
                    <i className="fa fa-long-arrow-right" aria-hidden="true" />
                    {to.get('name')}
                  </div>
                );
              }).toJS()
            }
          </div>
        </div>
      );
    }).toArray();

    return (
      <div>
        <div>
          <div styleName="totals">
            Total is <b>{totalAmount}</b> EUR of which each participants share is <b>{share}</b> EUR
          </div>
          <div styleName="payments">
            {paymentList}
          </div>
        </div>
      </div>
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

  renderSaveButton = (): ?ElementType => {
    const { isValid } = this.props;

    return (
      <button onClick={this.onShareExpenses} disabled={!isValid} styleName="shareExpenses">
        <i className="fa fa-floppy-o" aria-hidden="true" />
        Save expenses
      </button>
    );
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
            {this.renderSaveButton()}
          </div>
        </div>
        <div>
          {this.renderPayments()}
        </div>
      </div>
    );
  }
}

const mapState = (state: StateType): StateType => ({
  payments: state.payment.get('payments'),
  share: state.payment.get('share'),
  totalAmount: state.payment.get('totalAmount'),
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
