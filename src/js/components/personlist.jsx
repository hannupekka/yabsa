/** @jsx React.DOM */
var React = require('react/addons');
var Person = require('./person.jsx');
var person = require('../person.js');

module.exports = React.createClass({
    person: person,
    getInitialState: function() {
        return {persons: [
            {
                'name': 'bob',
                'paid': 10
            }, {
                'name': 'bill',
                'paid': 20
            }, {
                'name': 'joe',
                'paid': 30
            }]};
    },
    removePerson: function(idx) {
        this.setState({
            persons: React.addons.update(this.state.persons, {$splice: [[idx, 1]]})
        });
    },
    handleChange: function(field, value, idx) {
        var persons = this.state.persons.slice();
        persons[idx][field] = value;
        this.setState({persons: persons});
    },
    addPerson: function(event) {
        event.preventDefault();
        this.setState({persons: this.state.persons.concat([this.person])});
    },
    shareTotal: function(event) {
        event.preventDefault();
        this.props.onShareTotal(this.state.persons);
    },
    render: function() {
        var persons = this.state.persons.map(function(person, i) {
            return (
                <Person key={i} idx={i} name={person.name} paid={person.paid} personCount={this.state.persons.length} onPersonChange={this.handleChange} onDelete={this.removePerson.bind(this, i)} />
            );
        }.bind(this));

        return (
            <form id='personList' className='col-md-8'>
                {persons}
                <div id='buttons' className='col-xs-12'>
                    <button className='btn btn-lg btn-primary' onClick={this.addPerson}><i className='fa fa-user-plus'></i> Add person</button>
                    <button className='btn btn-lg btn-primary' onClick={this.shareTotal}><i className='fa fa-calculator'></i> Share total</button>
                </div>
            </form>
        );
    }
});
