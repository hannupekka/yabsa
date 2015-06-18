/** @jsx React.DOM */
var React = require('react');
var Person = require('./person.jsx');

module.exports = React.createClass({
    personRemoveHandler: function(idx) {
        if (typeof this.props.onDelete === 'function') {
            this.props.onDelete(idx);
        }
    },
    render: function() {
        var persons = this.props.persons.map(function(person, i) {
            return (
                <Person key={i} ref={i} onDelete={this.personRemoveHandler} idx={i} />
            );
        }.bind(this));

        return (
            <form id='personList' className='col-xs-8'>
                {persons}
            </form>
        );
    }
});
