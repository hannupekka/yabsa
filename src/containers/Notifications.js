// @flow
import styles from 'styles/containers/Notifications';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import CSSModules from 'react-css-modules';
import Notification from 'components/Notification';
import * as notificationActions from 'redux/modules/notification';

type Props = {
  notifications: List<Map<string, NotificationOptionsType>>,
  dismissNotification: (index: number) => ActionType
}

class Notifications extends Component {
  props: Props;
  renderNotifications = () => {
    const { notifications, dismissNotification } = this.props;

    return notifications.map((notification) => {
      return (
        <Notification
          data={notification}
          key={notification.get('id')}
          onDismiss={dismissNotification}
        />
      );
    }).toJS();
  }

  render(): ElementType {
    return (
      <div styleName="wrapper">
        <ReactCSSTransitionGroup
          transitionEnterTimeout={150}
          transitionLeaveTimeout={150}
          transitionName={{
            enter: styles.enter,
            enterActive: styles['enter--active'],
            leave: styles.leave,
            leaveActive: styles['leave--active']
          }}
        >
          {this.renderNotifications()}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

const mapState = (state: StateType): Object => ({
  notifications: state.notification.get('notifications')
});

const mapActions = {
  dismissNotification: notificationActions.dismissNotification
};

export default connect(
  mapState,
  mapActions
)(CSSModules(Notifications, styles));
