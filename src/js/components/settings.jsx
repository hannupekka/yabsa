/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({
    handleCurrencyChange: function(event) {
        this.props.onCurrencyChange(event.target.value);
    },
    render: function() {
        var settingsClassName = this.props.showSettings ? 'form-horizontal col-xs-12' : 'hidden';
        return (
            <form id='settings' className={settingsClassName}>
                <div className='form-group'>
                    <label htmlFor='currency'>Currency</label>
                    <select id='currency' className='form-control input-lg' onChange={this.handleCurrencyChange}>
                        <option value='EUR'>EUR</option>
                        <option value='USD'>USD</option>
                    </select>
                </div>
            </form>
        );
    }
});
