// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { forEach, round } from 'lodash';
import { Helmet } from 'react-helmet';
import Notifications from 'containers/Notifications';
import Confirm from 'components/Confirm';
import Person from 'components/Person';
import Loader from 'components/Loader';
import * as notificationActions from 'redux/modules/notification';
import * as personActions from 'redux/modules/person';
import * as paymentActions from 'redux/modules/payment';
import shareExpenses from 'utils/payments';

type Props = {
  params: Object,
  routeParams: Object,
  description: string,
  payments: Map,
  requestCount: number,
  share: number,
  totalAmount: number,
  persons: Map,
  isValid: bool,
  onAddPerson: () => ActionType,
  onAddNotification: (options: NotificationOptionsType) => Function,
  onCreateBill: (description: string, persons: Map) => Function,
  onDeleteBill: (bid: string) => Function,
  onDeletePerson: (id: string) => ActionType,
  onDeletePersons: () => Function,
  onFetchBill: (bid: string) => Function,
  onLoadPerson: (person: Object) => ActionType,
  onSetPayments: (payments: Map, share: number, totalAmount: number) => ActionType,
  onResetPayments: () => ActionType,
  onResetPersons: () => Function,
  onUpdateBill: (bid: string, description: string, persons: Map) => Function,
  onUpdateDescription: (description: string) => ActionType,
  onUpdateName: (id: string, value: string) => ActionType,
  onUpdateAmount: (id: string, value: string) => ActionType
};

type State = {
  showConfirm: bool
}

// eslint-disable-next-line
class Index extends Component {
  props: Props;
  state: State;

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      showConfirm: false
    };
  }

  componentDidMount = (): void => {
    // Attach event listener.
    window.addEventListener('keydown', this.onKeyDown);

    const { routeParams: { bid } } = this.props;

    if (bid) {
      this.props.onDeletePersons().then(() => {
        this.props.onFetchBill(bid).then(response => {
          if (response.error) {
            this.context.router.push('/');
          } else {
            forEach(response.payload.data, person => this.props.onLoadPerson(person));
            this.props.onUpdateDescription(response.payload.description);
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

  componentWillUnmount = (): void => {
    // Detach event listeners.
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onUpdateDescription = (e: InputEvent) => {
    const description = e.target.value;
    this.props.onUpdateDescription(description);
  }

  onAddPerson = (): void => {
    const { requestCount } = this.props;

    if (requestCount === 0) {
      this.props.onAddPerson();
    }
  }

  onDeleteBill = (): void => {
    this.onHideConfirm();

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

  onHideConfirm = (): void => {
    this.setState({
      showConfirm: false
    });
  }

  onKeyDown = (e: KeyboardEvent): bool => {
    const { isValid, requestCount } = this.props;

    if (!isValid || requestCount > 0) {
      return false;
    }

    if (e.key === 'Enter' && isValid && requestCount === 0) {
      this.onShareExpenses();
    }

    if (event.ctrlKey || event.metaKey) {
      // Handle CTRL+s combinations.
      if (String.fromCharCode(e.which).toLowerCase() === 's') {
        e.preventDefault();
        this.onSaveBill();
      }
    }

    return true;
  }

  onSaveBill = (): void => {
    const { routeParams: { bid }, description } = this.props;

    if (bid) {
      this.props.onUpdateBill(bid, description, this.props.persons).then(response => {
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
      this.props.onCreateBill(description, this.props.persons).then(response => {
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

  onShareExpenses = (): void => {
    const { persons, requestCount } = this.props;
    const payments = shareExpenses(persons);

    if (requestCount === 0) {
      this.props.onSetPayments(
        payments.get('payments'),
        Number(payments.get('share')),
        Number(payments.get('totalAmount'))
      );
    }
  }

  onShowConfirm = (): void => {
    this.setState({
      showConfirm: true
    });
  }

  renderDeleteButton = (): ?ElementType => {
    const { requestCount, routeParams: { bid } } = this.props;

    if (!bid) {
      return null;
    }

    return (
      <button
        id="delete"
        onClick={this.onShowConfirm}
        disabled={requestCount > 0}
        styleName="deleteBill"
      >
        <i className="fa fa-trash" aria-hidden="true" />
        Delete bill
      </button>
    );
  }

  renderFooter = (): ElementType => {
    return (
      <div styleName="footer">
        <a
          styleName="project"
          href="https://github.com/hannupekka/yabsa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check out this project in GitHub
          <i className="fa fa-github" aria-hidden="true"></i>
        </a>
      </div>
    );
  }

  renderLoader = (): ?ElementType => {
    const { requestCount } = this.props;

    return <Loader requestCount={requestCount} />;
  }

  renderPayments = (): ?ElementType => {
    const { payments, share, totalAmount } = this.props;

    if (payments.isEmpty() && totalAmount === 0) {
      return null;
    } else if (payments.isEmpty() && totalAmount !== 0) {
      return (
        <div id="totals" styleName="payments">
          All participants have paid equal amount - no need to share!
        </div>
      );
    }

    const paymentList = payments.map((payment, id) => {
      return (
        <div key={id} className="payment" styleName="payment">
          <b>{payment.get('from')}</b> pays:
          <div styleName="to">
            {
              payment.get('to').map((to, i) => {
                return (
                  <div key={i} className="target" styleName="target">
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
        <div id="totals" styleName="totals">
          Total is <b>{totalAmount} EUR</b> of which each participants share is <b>{share} EUR</b>
        </div>
        <div id="payments" styleName="payments">
          {paymentList}
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
          onAddPerson={this.onAddPerson}
          onDeletePerson={this.props.onDeletePerson}
          onUpdateName={this.props.onUpdateName}
          onUpdateAmount={this.props.onUpdateAmount}
          isLastPerson={i === persons.size - 1}
          hasMultiplePersons={persons.size > 1}
          {...person.toJS()}
        />
      );
    }).toJS();
  }

  renderSaveButton = (): ?ElementType => {
    const { isValid, requestCount } = this.props;

    return (
      <button
        id="save"
        onClick={this.onSaveBill}
        disabled={!isValid || requestCount > 0}
        styleName="saveExpenses"
      >
        <i className="fa fa-floppy-o" aria-hidden="true" />
        Save expenses
      </button>
    );
  }

  render() {
    const { isValid, requestCount, description } = this.props;
    const { showConfirm } = this.state;

    return (
      <div>
        <Helmet>
          <title>YABSA - {description || 'Yet another bill splitting app'}</title>
        </Helmet>
        <div styleName="description">
          <input
            id="description"
            type="text"
            placeholder="Description"
            styleName="input"
            value={description}
            onChange={this.onUpdateDescription}
          />
        </div>
        <div styleName="persons" onKeyDown={this.onKeyDown}>
          {this.renderPersons()}
          <div styleName="help">
            Protip: you can enter multiple amounts for person by separating them by space!
          </div>
          <div styleName="actions">
            <button
              id="add"
              onClick={this.onAddPerson}
              disabled={requestCount > 0}
              styleName="addPerson"
            >
              <i className="fa fa-user-plus" aria-hidden="true" />
              Add person
            </button>
            <button
              id="share"
              onClick={this.onShareExpenses}
              disabled={!isValid || requestCount > 0}
              styleName="shareExpenses"
            >
              <i className="fa fa-calculator" aria-hidden="true" />
              Share expenses
            </button>
            {this.renderSaveButton()}
            {this.renderDeleteButton()}
          </div>
        </div>
        {this.renderPayments()}
        {this.renderLoader()}
        {this.renderFooter()}
        <Confirm
          isVisible={showConfirm}
          onConfirm={this.onDeleteBill}
          onCancel={this.onHideConfirm}
        />
        <Notifications />
      </div>
    );
  }
}

const mapState = (state: StateType): StateType => ({
  description: state.payment.get('description'),
  payments: state.payment.get('payments'),
  requestCount: state.request.get('requestCount'),
  share: state.payment.get('share'),
  totalAmount: state.payment.get('totalAmount'),
  persons: state.person.get('persons'),
  isValid: state.person.get('persons').every(person => person.get('name') !== '' &&
    person.get('amount') !== '')
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
  onUpdateDescription: paymentActions.updateDescription,
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
