/** @jsx React.DOM */
var React = require('react/addons');
var Person = require('./person.jsx');
var httpinvoke = require('httpinvoke');

module.exports = React.createClass({
    componentDidMount: function() {
        var baseUrl = window.location.origin;
        if (this.props.bid) {
            httpinvoke(baseUrl + '/api/v1/bill/' + this.props.bid, 'GET', function(error, body, statusCode) {
                var data = JSON.parse(body);
                this.setState({persons: data.data});
            }.bind(this));
        }
    },
    getInitialState: function() {
        var persons = this.props.bid ? [] : [{
            'name': 'John Doe',
            'paid': '0'
        }];
        return {persons: persons};
    },
    removePerson: function(idx) {
        if (this.state.persons.length === 1) {
            return;
        }

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
        this.setState({persons: this.state.persons.concat([{name: 'John Doe', paid: 0}])});
    },
    shareTotal: function(event) {
        event.preventDefault();
        this.props.onShareTotal(this.state.persons);
    },
    toggleSettings: function(event) {
        event.preventDefault();
        this.props.onToggleSettings();
    },
    render: function() {
        var persons = this.state.persons.map(function(person, i) {
            return (
                <Person key={i} idx={i} name={person.name} paid={person.paid} personCount={this.state.persons.length} onPersonChange={this.handleChange} onDelete={this.removePerson.bind(this, i)} currency={this.props.currency} bid={this.props.bid} />
            );
        }.bind(this));

        return (
            <form id='personList' className='col-md-8'>
                {persons}
                <div id='help' className='col-xs-12'>Protip: you can enter multiple amounts for person by separating them by space!</div>
                <div id='buttons' className='col-xs-12'>
                    <button className='btn btn-lg btn-primary' onClick={this.addPerson}><i className='fa fa-user-plus'></i><span className='hidden-xs'> Add person</span></button>
                    <button className='btn btn-lg btn-primary settings' onClick={this.toggleSettings}><i className='fa fa-cog'></i><span className='hidden-xs'> Settings</span></button>
                    <button className='btn btn-lg btn-primary' onClick={this.shareTotal}><i className='fa fa-calculator'></i><span className='hidden-xs'> Share total</span></button>
                </div>
            </form>
        );
    }
});
