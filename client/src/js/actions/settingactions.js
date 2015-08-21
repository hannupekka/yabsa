var Reflux = require('reflux'),
    SettingActions = Reflux.createActions([
        'toggleVisibility',
        'setCurrency',
        'setBid',
        'reset'
    ]);

module.exports = SettingActions;
