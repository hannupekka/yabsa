/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    PersonList = require('./personlist.jsx'),
    PaymentList = require('./paymentlist.jsx'),
    Settings = require('./settings.jsx'),
    Router = require('react-router'),
    PersonActions = require('../actions/personactions.js'),
    SettingActions = require('../actions/settingactions.js'),
    PersonStore = require('../stores/personstore.js'),
    ValidateStore = require('../stores/validatestore.js'),
    SettingStore = require('../stores/settingstore.js'),
    request = require('browser-request'),
    shareBill = require('../functions.js');

module.exports = React.createClass({
    mixins: [
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(ValidateStore, 'validation'),
        Reflux.connect(SettingStore, 'settings')
    ],
    contextTypes: {
        router: React.PropTypes.func
    },
    componentDidMount: function () {
        var baseUrl = window.location.origin,
            bid = this.context.router.getCurrentParams().bid;
        if (bid) {
            request(baseUrl + '/api/v1/bill/' + bid, function (error, response, body) {
                if (response.statusCode !== 200) {
                    this.context.router.transitionTo('index');
                } else {
                    var data = JSON.parse(body),
                        results = shareBill(this.getData(data.data));
                    PersonActions.setPersons(data.data);
                    SettingActions.setCurrency(data.currency);
                    PersonActions.shareTotal(results);
                }
            }.bind(this));
        }
    },
    addPerson: function (event) {
        if (event) {
            event.preventDefault();
        }

        PersonActions.addPerson();
    },
    toggleSettings: function (event) {
        if (event) {
            event.preventDefault();
        }

        SettingActions.toggleVisibility();
    },
    shareTotal: function (event) {
        if (event) {
            event.preventDefault();
        }

        if (!this.state.validation.valid) {
            return;
        }

        var baseUrl = window.location.origin,
            router = this.context.router,
            bid = router.getCurrentParams().bid,
            method = bid ? 'PUT' : 'POST',
            url = bid ? '/bill/' + bid : '/bill',
            results = shareBill(this.getData(this.state.persons.personList));

        PersonActions.shareTotal(results);

        request({url: baseUrl + '/api/v1' + url, method: method, body: {data: this.state.persons.personList, currency: this.state.settings.currency}, json: true}, function (error, response, body) {
            if (!bid) {
                SettingActions.setBid(body.bid);
                router.transitionTo('bill', {bid: body.bid});
            }
        }.bind(this));
    },

    deleteBill: function (event) {
        if (event) {
            event.preventDefault();
        }

        var baseUrl = window.location.origin,
            router = this.context.router,
            bid = router.getCurrentParams().bid;

        request({url: baseUrl + '/api/v1/bill/' + bid, method: 'DELETE'}, function (error, response, body) {
            PersonActions.reset();
            SettingActions.reset();
            router.transitionTo('index');
        }.bind(this));
    },
    getData: function (persons) {
        var data = [],
            i = 0,
            personCount = persons.length,
            person,
            paid;
        for (; i < personCount; i++) {
            person = persons[i];
            // Sum amounts if multiple given. Also replace commas.
            paid = typeof person.paid === 'string' ? person.paid.split(' ').reduce(function (prev, current) {
                return Number(prev) + Number(current.replace(',', '.'));
            }, 0) : person.paid;
            data.push({
                name: person.name,
                paid: Number(paid)
            });
        }

        return data;
    },
    render: function () {
        var deleteButton =
            function () {
                var bid = this.context.router.getCurrentParams().bid;
                if (bid) {
                    return (
                        <button className='btn btn-sm btn-primary' onClick={this.deleteBill}><i className='fa fa-trash-o'></i><span className='hidden-xs'> Delete</span></button>
                    );
                }
            }.bind(this),
            disabled = this.state.validation.valid ? undefined : 'disabled';

        return (
            <div>
                <Settings />
                <div className='col-xs-8'>
                    <PersonList />
                    <div id='buttons' className='col-xs-12'>
                        <button className='btn btn-sm btn-primary' onClick={this.addPerson}><i className='fa fa-user-plus'></i><span className='hidden-xs'> Add person</span></button>
                        <button className='btn btn-sm btn-primary settings' onClick={this.toggleSettings}><i className='fa fa-cog'></i><span className='hidden-xs'> Settings</span></button>
                        <button className='btn btn-sm btn-primary' onClick={this.shareTotal} disabled={disabled}><i className='fa fa-calculator'></i><span className='hidden-xs'> Share total</span></button>
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
