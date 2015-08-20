var Reflux = require('reflux');

var SettingActions = Reflux.createActions([
    'toggleVisibility',
    'setCurrency',
    'setBid',
    'reset'
]);

module.exports = SettingActions;