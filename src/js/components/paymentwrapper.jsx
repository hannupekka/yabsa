/** @jsx React.DOM */
var React = require('react/addons');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var person = require('../person.js');
var shareBill = require('../functions.js');
var _each = require('lodash.foreach');

module.exports = React.createClass({
    person: person,
    getInitialState: function() {
        return {persons: [this.person], payments: {}, total: 0, share: 0};
    },
    shareTotal: function() {
        var data = [];
        _each(this.refs.persons.refs, function(ref) {
            data.push({
                name: ref.state.name,
                paid: Number(ref.state.paid)
            });
        });
        var results = shareBill(data);
        this.setState({payments: results.payments, total: results.total, share: results.share});
    },
    addPerson: function() {
        this.setState({persons: this.state.persons.concat([this.person])});
    },
    removePerson: function(idx) {
        var persons = React.addons.update(this.state.persons, {$push: []});
        delete persons[idx];
        delete this.refs.persons.refs[idx];
        this.setState({persons: persons});
    },
    render: function() {
        return (
            <div>
                <PersonList ref='persons' persons={this.state.persons} onDelete={this.removePerson} />
                <PaymentList payments={this.state.payments} total={this.state.total} share={this.state.share} />
                <div id='buttons' className='col-xs-12'>
                    <button className='btn btn-lg btn-primary' onClick={this.addPerson}>Add person</button>
                    <button className='btn btn-lg btn-primary' onClick={this.shareTotal}>Share total</button>
                </div>
            </div>
        );
    }
});