/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var SettingActions = require('../actions/settingactions.js');
var SettingStore = require('../stores/settingstore.js');

module.exports = React.createClass({
    mixins: [Reflux.connect(SettingStore, 'settings')],
    setCurrency: function(event) {
        SettingActions.setCurrency(event.target.value);
    },
    render: function() {
        var isVisible = function() {
            return this.state.settings.visible ? 'form-horizontal col-xs-12' : 'hidden';
        }.bind(this);

        return (
            <form id='settings' className={isVisible()}>
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
