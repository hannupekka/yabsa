// @flow
import { fromJS, Map } from 'immutable';
import cuid from 'cuid';

// Options.
const defaultOptions = {
  title: '',
  body: '',
  type: 'success',
  icon: '',
  timeout: 2000
};

// Action types.
export const SHOW = 'yabsa/notification/SHOW';
export const DISMISS = 'yabsa/notification/DISMISS';

// Actions.
export const dismissNotification = (id: number = 0): ActionType => ({
  type: DISMISS,
  payload: {
    id
  }
});

export const addNotification = (options: NotificationOptionsType = defaultOptions): Function => {
  return (dispatch: Function) => {
    const id = cuid();
    const {
      title = defaultOptions.title,
      body = defaultOptions.body,
      type = defaultOptions.type,
      icon = defaultOptions.icon,
      timeout = defaultOptions.timeout
    } = options;

    const timeoutId = setTimeout(() => {
      dispatch(dismissNotification(id));
    }, timeout);

    return dispatch({
      type: SHOW,
      payload: {
        id,
        timeoutId,
        title,
        body,
        type,
        icon
      }
    });
  };
};

// Reducer.
export const initialState = fromJS({
  notifications: [],
});

export default function reducer(state: StateType = initialState, action: ActionType): StateType {
  switch (action.type) {
    case SHOW:
      return state.update('notifications', (list) => list.unshift(Map(action.payload)));
    case DISMISS:
      return state.update('notifications', (list) =>
        list.filterNot((item) => item.get('id') === action.payload.id)
      );
    default:
      return state;
  }
}
