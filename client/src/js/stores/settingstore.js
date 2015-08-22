var Reflux = require('reflux'),
    SettingActions = require('../actions/settingactions.js'),
    Settings = function () {
        return {
            visible: false,
            currency: 'EUR',
            bid: undefined
        }
    },
    SettingStore = Reflux.createStore({
        listenables: [SettingActions],
        settings: new Settings(),
        getInitialState: function () {
            return this.settings;
        },
        toggleVisibility: function () {
            this.settings.visible = !this.settings.visible;
            this.trigger(this.settings);
        },
        setCurrency: function (currency) {
            this.settings.currency = currency;
            this.trigger(this.settings);
        },
        setBid: function (bid) {
            this.settings.bid = bid;
            this.trigger(this.settings);
        },
        reset: function () {
            this.settings = new Settings();
            this.trigger(this.settings);
        }
    });

module.exports = SettingStore;
