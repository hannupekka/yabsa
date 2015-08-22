/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    SettingActions = require('../actions/settingactions.js'),
    SettingStore = require('../stores/settingstore.js'),
    classNames = require('classnames');

module.exports = React.createClass({
    mixins: [Reflux.connect(SettingStore, 'settings')],
    setCurrency: function (event) {
        SettingActions.setCurrency(event.target.value);
    },
    render: function () {
        var classes = classNames({
            'form-horizontal': true,
            'col-xs-12': true,
            'hidden': !this.state.settings.visible
        });

        return (
            <form id='settings' className={classes}>
                <div className='form-group'>
                    <label htmlFor='currency'>Currency</label>
                    <select id='currency' className='form-control input-lg' onChange={this.setCurrency}>
                        <option value='EUR'>EUR</option>
                        <option value='USD'>USD</option>
                    </select>
                </div>
            </form>
        );
    }
});
