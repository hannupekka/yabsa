// @flow
import styles from 'styles/containers/Index';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';

type Props = {
  params: Object,
};

// eslint-disable-next-line
class Index extends Component {
  props: Props;

  render() {
    return (
      <div>
      </div>
    );
  }
}

const mapState = (): StateType => ({});
const mapActions = (): Object => ({});

export default connect(
  mapState,
  mapActions
)(CSSModules(Index, styles));
