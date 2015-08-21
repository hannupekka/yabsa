/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    PersonActions = require('../actions/personactions.js'),
    ValidateActions = require('../actions/validateactions.js'),
    PersonStore = require('../stores/personstore.js'),
    ValidateStore = require('../stores/validatestore.js'),
    SettingStore = require('../stores/settingstore.js'),
    classNames = require('classnames');

module.exports = React.createClass({
    mixins: [
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(ValidateStore, 'validation'),
        Reflux.connect(SettingStore, 'settings')
    ],
    handleChange: function (field, event) {
        PersonActions.editPerson(field, event.target.value, this.props.idx);
    },
    handleDelete: function (event) {
        if (event) {
            event.preventDefault();
        }
        PersonActions.deletePerson(this.props.idx, event);
    },
    setName: function () {
        return this.props.person.name;
    },
    setPaid: function () {
        return this.props.person.paid;
    },
    render: function () {
        var deleteButton = function () {
            if (this.state.persons.personList && this.state.persons.personList.length > 1) {
                return (
                    <div className='col-xs-1'>
                        <button className='btn btn-primary btn-sm btn-remove' onClick={this.handleDelete} tabIndex='-1'><i className='fa fa-minus'></i></button>
                    </div>
                );
            }
        }.bind(this),
        nameClasses = classNames({
            'person__name': true,
            'col-xs-4': true,
            'has-error': !this.state.validation.persons[this.props.idx].name
        }),
        paidClasses = classNames({
            'input-group': true,
            'has-error': !this.state.validation.persons[this.props.idx].paid
        });

        return (
            <div className='personList__person clearfix'>
                <div className={nameClasses}>
                    <input type='text' className='form-control input-lg' placeholder='John Doe' value={this.setName()} onChange={this.handleChange.bind(this, 'name')} autoFocus />
                </div>
                <div className='person__paid col-xs-6'>
                    <div className={paidClasses}>
                        <input type='tel' className='form-control input-lg' placeholder='0' value={this.setPaid()} onChange={this.handleChange.bind(this, 'paid')} />
                        <div className="input-group-addon">{this.state.settings.currency}</div>
                    </div>
                </div>
                {deleteButton()}
            </div>
        );
    }
});
