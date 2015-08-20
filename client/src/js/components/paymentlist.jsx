/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var Payment = require('./payment.jsx');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var PersonStore = require('../stores/personstore.js');
var SettingStore = require('../stores/settingstore.js');

var _map = require('lodash.map');

module.exports = React.createClass({
    mixins: [
        IntlMixin,
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings')
    ],
    render: function() {
        var payments = _map(this.state.persons.payments, function(payment, i) {
            var personsPayments = payment.to.map(function(p, j) {
                return (
                    <Payment key={j} to={p.to} amount={p.amount} />
                );
            });

            return (
                <div key={i} className='paymentList__payment clearfix'>
                    <div className='paymentList__from'>{payment.name}</div>
                    <div className='paymentList__transactions clearfix bg-primary'>
                        {personsPayments}
                    </div>
                </div>
            );
        });

        return (
            <div id='paymentList'>
                <div className='stats'>
                    <b>Total: </b> <FormattedNumber value={this.state.persons.total} style='currency' currency={this.state.settings.currency} /> <br />
                    <b>Share: </b> <FormattedNumber value={this.state.persons.share} style='currency' currency={this.state.settings.currency} /> <br />
                </div>
                {payments}
            </div>
        );
    }
});