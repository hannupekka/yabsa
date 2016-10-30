// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { forEach, round } from 'lodash';
import Person from 'components/Person';
import * as personActions from 'redux/modules/person';
import * as paymentActions from 'redux/modules/payment';
import shareExpenses from 'utils/payments';

type Props = {
  params: Object,
  routeParams: Object,
  payments: Map,
  share: number,
  totalAmount: number,
  persons: Map,
  isValid: bool,
  onAddPerson: () => ActionType,
  onCreateBill: (persons: Map) => Function,
  onDeletePerson: (id: string) => ActionType,
  onDeletePersons: () => Function,
  onFetchBill: (bid: string) => Function,
  onLoadPerson: (person: Object) => ActionType,
  onSetPayments: (payments: Map, share: number, totalAmount: number) => ActionType,
  onResetPayments: () => ActionType,
  onResetPersons: () => Function,
  onUpdateName: (id: string, value: string) => ActionType,
  onUpdateAmount: (id: string, value: string) => ActionType
};

// eslint-disable-next-line
class Index extends Component {
  props: Props;

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentDidMount = (): void => {
    const { routeParams: { bid } } = this.props;

    if (bid) {
      this.props.onDeletePersons().then(() => {
        this.props.onFetchBill(bid).then(response => {
          if (response.error) {
            this.context.router.push('/');
          } else {
            forEach(response.payload.data, person => this.props.onLoadPerson(person));
          }
        });
      });
    }
  }

  componentDidUpdate = (prevProps: Object): void => {
    const { routeParams: { bid } } = this.props;
    if (!bid && prevProps.routeParams.bid) {
      this.props.onResetPersons().then(() => this.props.onResetPayments());
    }
  }

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

  onCreateBill = (): void => {
    this.props.onCreateBill(this.props.persons).then(response => {
      this.context.router.push(response.payload.bid);
    });
  }

  renderPayments = (): ?ElementType => {
    const { payments, share, totalAmount } = this.props;

    if (payments.isEmpty() && totalAmount === 0) {
      return null;
    } else if (payments.isEmpty() && totalAmount !== 0) {
      return (
        <div styleName="payments">All participants have paid equal amount - no need to share!</div>
      );
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
            Total is <b>{totalAmount} EUR</b> of which each participants share is <b>{share} EUR</b>
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
    const { isValid, routeParams: { bid } } = this.props;

    return (
      <button onClick={this.onCreateBill} disabled={!isValid} styleName="saveExpenses">
        <i className="fa fa-floppy-o" aria-hidden="true" />
        { bid ? 'Update expenses' : 'Save expenses' }
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

const mapActions = {
  onAddPerson: personActions.addPerson,
  onCreateBill: paymentActions.createBill,
  onDeletePerson: personActions.deletePerson,
  onDeletePersons: personActions.deletePersons,
  onFetchBill: paymentActions.fetchBill,
  onLoadPerson: personActions.loadPerson,
  onSetPayments: paymentActions.setPayments,
  onResetPayments: paymentActions.resetPayments,
  onResetPersons: personActions.resetPersons,
  onUpdateName: personActions.updateName,
  onUpdateAmount: personActions.updateAmount,
};

export default connect(
  mapState,
  mapActions
)(CSSModules(Index, styles));
