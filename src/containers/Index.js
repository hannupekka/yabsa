// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { forEach, round } from 'lodash';
import Notifications from 'containers/Notifications';
import Person from 'components/Person';
import Loader from 'components/Loader';
import * as notificationActions from 'redux/modules/notification';
import * as personActions from 'redux/modules/person';
import * as paymentActions from 'redux/modules/payment';
import shareExpenses from 'utils/payments';

type Props = {
  params: Object,
  routeParams: Object,
  payments: Map,
  requestCount: number,
  share: number,
  totalAmount: number,
  persons: Map,
  isValid: bool,
  onAddPerson: () => ActionType,
  onAddNotification: (options: NotificationOptionsType) => Function,
  onCreateBill: (persons: Map) => Function,
  onDeleteBill: (bid: string) => Function,
  onDeletePerson: (id: string) => ActionType,
  onDeletePersons: () => Function,
  onFetchBill: (bid: string) => Function,
  onLoadPerson: (person: Object) => ActionType,
  onSetPayments: (payments: Map, share: number, totalAmount: number) => ActionType,
  onResetPayments: () => ActionType,
  onResetPersons: () => Function,
  onUpdateBill: (bid: string, persons: Map) => Function,
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
            this.onShareExpenses();
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

  onDeleteBill = (): void => {
    const { routeParams: { bid } } = this.props;
    this.props.onDeleteBill(bid).then(response => {
      if (response.error) {
        this.props.onAddNotification({
          title: 'Error',
          body: 'Deleting bill failed!',
          icon: 'fa fa-exclamation',
          type: 'error'
        });
      } else {
        this.context.router.replace('/');
        this.props.onAddNotification({
          title: 'Success',
          body: 'Bill deleted!',
          icon: 'fa fa-check',
          type: 'success'
        });
      }
    });
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

  onSaveBill = (): void => {
    const { routeParams: { bid } } = this.props;

    if (bid) {
      this.props.onUpdateBill(bid, this.props.persons).then(response => {
        if (response.error) {
          this.props.onAddNotification({
            title: 'Error',
            body: 'Saving expenses failed!',
            icon: 'fa fa-exclamation',
            type: 'error'
          });
        } else {
          this.props.onAddNotification({
            title: 'Success',
            body: 'Bill updated!',
            icon: 'fa fa-check',
            type: 'success'
          });
        }
      });
    } else {
      this.props.onCreateBill(this.props.persons).then(response => {
        if (response.error) {
          this.props.onAddNotification({
            title: 'Error',
            body: 'Saving expenses failed!',
            icon: 'fa fa-exclamation',
            type: 'error'
          });
        } else {
          this.context.router.push(response.payload.bid);
          this.props.onAddNotification({
            title: 'Success',
            body: 'Expenses saved!',
            icon: 'fa fa-check',
            type: 'success'
          });
        }
      });
    }
  }

  renderDeleteButton = (): ?ElementType => {
    const { routeParams: { bid } } = this.props;

    if (!bid) {
      return null;
    }

    return (
      <button onClick={this.onDeleteBill} styleName="deleteBill">
        <i className="fa fa-trash" aria-hidden="true" />
        Delete bill
      </button>
    );
  }

  renderLoader = (): ?ElementType => {
    const { requestCount } = this.props;

    if (requestCount === 0) {
      return null;
    }

    return <Loader />;
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
    const { isValid } = this.props;

    return (
      <button onClick={this.onSaveBill} disabled={!isValid} styleName="saveExpenses">
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
            {this.renderDeleteButton()}
          </div>
        </div>
        <div>
          {this.renderPayments()}
        </div>
        {this.renderLoader()}
        <Notifications />
      </div>
    );
  }
}

const mapState = (state: StateType): StateType => ({
  payments: state.payment.get('payments'),
  requestCount: state.request.get('requestCount'),
  share: state.payment.get('share'),
  totalAmount: state.payment.get('totalAmount'),
  persons: state.person.get('persons'),
  isValid: state.person.get('persons')
    .every(person => person.get('name') !== '' && person.get('amount') !== '')
});

const mapActions = {
  onAddPerson: personActions.addPerson,
  onAddNotification: notificationActions.addNotification,
  onCreateBill: paymentActions.createBill,
  onDeleteBill: paymentActions.deleteBill,
  onDeletePerson: personActions.deletePerson,
  onDeletePersons: personActions.deletePersons,
  onFetchBill: paymentActions.fetchBill,
  onLoadPerson: personActions.loadPerson,
  onSetPayments: paymentActions.setPayments,
  onResetPayments: paymentActions.resetPayments,
  onResetPersons: personActions.resetPersons,
  onUpdateBill: paymentActions.updateBill,
  onUpdateName: personActions.updateName,
  onUpdateAmount: personActions.updateAmount,
};

export default connect(
  mapState,
  mapActions
)(CSSModules(Index, styles));
