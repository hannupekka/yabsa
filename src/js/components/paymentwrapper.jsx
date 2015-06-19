/** @jsx React.DOM */
var React = require('react');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var shareBill = require('../functions.js');

module.exports = React.createClass({
    getInitialState: function() {
        return {payments: {}, total: 0, share: 0};
    },
    shareTotal: function(persons) {
        var data = [];
        var i = 0;
        var personCount = persons.length;
        var person;
        for (; i < personCount; i++) {
            person = persons[i];
            data.push({
                name: person.name,
                paid: Number(person.paid)
            });
        }
        var results = shareBill(data);
        this.setState({payments: results.payments, total: results.total, share: results.share});
    },
    render: function() {
        return (
            <div>
                <PersonList onShareTotal={this.shareTotal} />
                <PaymentList payments={this.state.payments} total={this.state.total} share={this.state.share} />
            </div>
        );
    }
});