/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    Payment = require('./payment.jsx'),
    ReactIntl = require('react-intl'),
    IntlMixin = ReactIntl.IntlMixin,
    FormattedNumber = ReactIntl.FormattedNumber,
    PersonStore = require('../stores/personstore.js'),
    SettingStore = require('../stores/settingstore.js'),
    map = require('lodash.map');

module.exports = React.createClass({
    mixins: [
        IntlMixin,
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings')
    ],
    render: function () {
        var payments = map(this.state.persons.payments, function (payment, i) {
            var personsPayments = payment.to.map(function (p, j) {
                return (
                    <Payment key={j} to={p.to} amount={p.amount} />
                );
            });

            return (
                <div key={i} className='paymentList__payment clearfix col-md-4'>
                    <div className='paymentList__from'>{payment.name} pays:</div>
                    <div className='paymentList__transactions clearfix bg-primary'>
                        {personsPayments}
                    </div>
                </div>
            );
        }),
            className = Object.keys(this.state.persons.payments).length > 0 ? 'clearfix' : 'hidden';

        return (
            <div id='paymentList' className={className}>
                <div className='stats col-xs-12'>
                    <b>Total: </b> <FormattedNumber value={this.state.persons.total} style='currency' currency={this.state.settings.currency} /> <br />
                    <b>Share: </b> <FormattedNumber value={this.state.persons.share} style='currency' currency={this.state.settings.currency} /> <br />
                </div>
                {payments}
            </div>
        );
    }
});
