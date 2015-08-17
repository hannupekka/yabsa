/** @jsx React.DOM */
var React = require('react');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var Settings = require('./settings.jsx');
var Router = require('react-router');
var request = require('browser-request');
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

        var baseUrl = window.location.origin;
        var router = this.context.router;
        var method = this.state.bid ? 'PUT' : 'POST';
        var url = this.state.bid ? '/bill/' + this.state.bid : '/bill';
        var bid = this.state.bid;

        request({url: baseUrl + '/api/v1' + url, method: method, body: {data: persons, currency: this.state.currency}, json: true}, function(error, response, body) {
            if (!this.state.bid) {
                bid = JSON.parse(body).bid;
                router.transitionTo('bill', {bid: bid});
            }

            this.setState({payments: results.payments, total: results.total, share: results.share, bid: bid});
        }.bind(this));
    },
    render: function() {
        var router = this.context.router;
        return (
            <div>
                <Settings onCurrencyChange={this.changeCurrency} currency={this.state.currency} showSettings={this.state.showSettings} />
                <PersonList onShareTotal={this.shareTotal} onCurrencyChange={this.changeCurrency} currency={this.state.currency} onToggleSettings={this.toggleSettings} bid={this.state.bid} />
                <PaymentList payments={this.state.payments} total={this.state.total} share={this.state.share} currency={this.state.currency} />
            </div>
        );
    }
});