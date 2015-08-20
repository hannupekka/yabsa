/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var Settings = require('./settings.jsx');
var Router = require('react-router');
var PersonActions = require('../actions/personactions.js');
var SettingActions = require('../actions/settingactions.js');
var PersonStore = require('../stores/personstore.js');
var SettingStore = require('../stores/settingstore.js');

var request = require('browser-request');
var shareBill = require('../functions.js');

module.exports = React.createClass({
    mixins: [
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings')
    ],
    contextTypes: {
        router: React.PropTypes.func
    },
    componentDidMount: function() {
        var baseUrl = window.location.origin;
        var bid = this.context.router.getCurrentParams().bid;
        if (bid) {
            request(baseUrl + '/api/v1/bill/' + bid, function(error, response, body) {
                var data = JSON.parse(body);
                PersonActions.setPersons(data.data);
                SettingActions.setCurrency(data.currency);
                var results = shareBill(this.getData(data.data));
                PersonActions.shareTotal(results);
            }.bind(this));
        }
    },
    addPerson: function(event) {
        if (event) {
            event.preventDefault();
        }

        PersonActions.addPerson();
    },
    toggleSettings: function(event) {
        if (event) {
            event.preventDefault();
        }

        SettingActions.toggleVisibility();
    },
    shareTotal: function(event) {
        if (event) {
            event.preventDefault();
        }

        var results = shareBill(this.getData(this.state.persons.personList));
        PersonActions.shareTotal(results);

        var baseUrl = window.location.origin;
        var router = this.context.router;
        var bid = router.getCurrentParams().bid;
        var method = bid ? 'PUT' : 'POST';
        var url = bid ? '/bill/' + bid : '/bill';

        request({url: baseUrl + '/api/v1' + url, method: method, body: {data: this.state.persons.personList, currency: this.state.settings.currency}, json: true}, function(error, response, body) {
            if (!bid) {
                SettingActions.setBid(body.bid);
                router.transitionTo('bill', {bid: body.bid});
            }
        }.bind(this));
    },

    deleteBill: function(event) {
        if (event) {
            event.preventDefault();
        }

        var baseUrl = window.location.origin;
        var router = this.context.router;
        var bid = router.getCurrentParams().bid;

        request({url: baseUrl + '/api/v1/bill/' + bid, method: 'DELETE'}, function(error, response, body) {
            PersonActions.reset();
            SettingActions.reset();
            router.transitionTo('index');
        }.bind(this));
    },
    getData: function(persons) {
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

        return data;
    },
    render: function() {
        var deleteButton = function() {
            var bid = this.context.router.getCurrentParams().bid;
            if (bid) {
                return (
                    <button className='btn btn-lg btn-primary' onClick={this.deleteBill}><i className='fa fa-trash-o'></i><span className='hidden-xs'> Delete</span></button>
                );
            }
        }.bind(this);

        return (
            <div>
                <Settings />
                <div className='col-xs-8'>
                    <PersonList />
                    <div id='buttons' className='col-xs-12'>
                        <button className='btn btn-lg btn-primary' onClick={this.addPerson}><i className='fa fa-user-plus'></i><span className='hidden-xs'> Add person</span></button>
                        <button className='btn btn-lg btn-primary settings' onClick={this.toggleSettings}><i className='fa fa-cog'></i><span className='hidden-xs'> Settings</span></button>
                        <button className='btn btn-lg btn-primary' onClick={this.shareTotal}><i className='fa fa-calculator'></i><span className='hidden-xs'> Share total</span></button>
                        {deleteButton()}
                    </div>
                </div>
                <div className='col-xs-4'>
                    <PaymentList />
                </div>
            </div>
        );
    }
});