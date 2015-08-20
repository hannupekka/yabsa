/** @jsx React.DOM */
var React = require('react/addons');
var Reflux = require('reflux');
var Person = require('./person.jsx');
var PersonStore = require('../stores/personstore.js');
var request = require('browser-request');

module.exports = React.createClass({
    mixins: [Reflux.connect(PersonStore, 'persons')],
    render: function() {
        var persons = '';
        if (this.state.persons.personList) {
            persons = this.state.persons.personList.map(function(person, i) {
                return (
                    <Person key={i} idx={i} person={person} />
                );
            }.bind(this));
        }

        return (
            <form id='personList'>
                {persons}
                <div id='help' className='col-xs-12'>Protip: you can enter multiple amounts for person by separating them by space!</div>
            </form>

        );
    }
});
