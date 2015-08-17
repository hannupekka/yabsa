/** @jsx React.DOM */
var React = require('react');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var Settings = require('./settings.jsx');
var Router = require('react-router');
var shareBill = require('../functions.js');

module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function() {
        return {payments: {}, total: 0, share: 0, currency: 'EUR', showSettings: false, bid: this.context.router.getCurrentParams().bid || false};
    },
    changeCurrency: function(currency) {
      this.setState({currency: currency});
    },
    toggleSettings: function() {
      this.setState({showSettings: !this.state.showSettings});
    },
    shareTotal: function(persons) {
        var data = [];
        var i = 0;
        var personCount = persons.length;
        var person;
        var paid;
        for (; i < personCount; i++) {
            person = persons[i];
            // Sum amounts if multiple given. Also replace commas.
            paid = typeof person.paid === 'string' ? person.paid.split(' ').reduce(function(prev, current) {
                return Number(prev) + Number(current.replace(',', '.'));
            }, 0) : person.paid;
            data.push({
                name: person.name,
                paid: Number(paid)
            });
        }
        var results = shareBill(data);
        this.setState({payments: results.payments, total: results.total, share: results.share});
    },
    render: function() {
        var router = this.context.router;
        return (
            <div>
                <Settings onCurrencyChange={this.changeCurrency} showSettings={this.state.showSettings} />
                <PersonList onShareTotal={this.shareTotal} currency={this.state.currency} onToggleSettings={this.toggleSettings} bid={this.state.bid}/>
                <PaymentList payments={this.state.payments} total={this.state.total} share={this.state.share} currency={this.state.currency} />
            </div>
        );
    }
});