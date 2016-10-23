// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import Person from 'components/Person';
import * as personActions from 'redux/modules/person';

type Props = {
  params: Object,
  persons: Map,
  onAddPerson: Function,
  onDeletePerson: Function,
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
    return (
      <div>
        <div styleName="persons" onKeyDown={this.onKeyDown}>
          {this.renderPersons()}
          <div styleName="actions">
            <button onClick={this.props.onAddPerson} styleName="addPerson">
              <i className="fa fa-user-plus" aria-hidden="true" />
              Add person
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state: StateType): StateType => ({
  persons: state.person.get('persons')
});

const mapActions = (dispatch: Function): Object => ({
  onAddPerson: (): Function => dispatch(personActions.addPerson()),
  onDeletePerson: (id: string): Function => dispatch(personActions.deletePerson(id)),
  onUpdateName: (id: string, value: string) => dispatch(personActions.updateName(id, value)),
  onUpdateAmount: (id: string, value: string) => dispatch(personActions.updateAmount(id, value))
});

export default connect(
  mapState,
  mapActions
)(CSSModules(Index, styles));
