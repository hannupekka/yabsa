/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var PersonActions = require('../actions/personactions.js');
var PersonStore = require('../stores/personstore.js');
var SettingStore = require('../stores/settingstore.js');

module.exports = React.createClass({
    mixins: [
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings'),
    ],
    handleChange: function(field, event) {
        PersonActions.editPerson(field, event.target.value, this.props.idx);
    },
    handleDelete: function(event) {
        if (event) {
            event.preventDefault();
        }
        PersonActions.deletePerson(this.props.idx, event);
    },
    setName: function() {
        return this.props.person.pristine ? undefined : this.props.person.name;
    },
    setPaid: function() {
        return this.props.person.pristine ? undefined : this.props.person.paid;
    },
    render: function() {
        var deleteButton = function() {
            if (this.state.persons.personList && this.state.persons.personList.length > 1) {
                return (
                    <div className='col-xs-1'>
                        <button className='btn btn-primary btn-sm btn-remove' onClick={this.handleDelete} tabIndex='-1'><i className='fa fa-minus'></i></button>
                    </div>
                );
            }
        }.bind(this);

        return (
            <div className='personList__person clearfix'>
                <div className='person__name col-xs-4'>
                    <input type='text' className='form-control input-lg' placeholder={this.props.person.name} value={this.setName()} onChange={this.handleChange.bind(this, 'name')} autoFocus />
                </div>
                <div className='person__paid col-xs-6'>
                    <div className='input-group'>
                        <input type='tel' className='form-control input-lg' placeholder={this.props.person.paid} value={this.setPaid()} onChange={this.handleChange.bind(this, 'paid')} />
                        <div className="input-group-addon">{this.state.settings.currency}</div>
                    </div>
                </div>
                {deleteButton()}
            </div>
        );
    }
});
