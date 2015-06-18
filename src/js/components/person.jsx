/** @jsx React.DOM */
var React = require('react');
var person = require('../person.js');

module.exports = React.createClass({
    getInitialState: function() {
        return person;
    },
    handleChange: function(field, event) {
        var change = {};
        change[field] = event.target.value;
        this.setState(change);
    },
    delete: function(event) {
        event.preventDefault();
        if (typeof this.props.onDelete === 'function') {
            this.props.onDelete(this.props.idx);
        }
    },
    render: function() {
        return (
            <div className='personList__person clearfix'>
                <div className='person__name col-xs-4'>
                    <input type='text' className='form-control input-lg' placeholder={this.state.name} onChange={this.handleChange.bind(this, 'name')} autoFocus />
                </div>
                <div className='person__paid col-xs-7'>
                    <div className='input-group'>
                    <div className="input-group-addon">€</div>
                    <input type='number' className='form-control input-lg' placeholder={this.state.paid} onChange={this.handleChange.bind(this, 'paid')} />
                    </div>
                </div>
                <div className='col-xs-1'>
                    <button className='btn btn-primary btn-lg' onClick={this.delete}>-</button>
                </div>
            </div>
        );
    }
});