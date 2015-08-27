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
    request = require('superagent'),
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
        // Attach event listener.
        window.addEventListener('keydown', this.handleKeyDown);

        // Get current bill ID.
        var bid = this.context.router.getCurrentParams().bid;

        // If bill ID exists, load data.
        if (bid) {
            request
            .get('/api/v1/bill/' + bid)
            .end(function (error, response) {
                if (response.status !== 200) {
                    // Invalid bill ID, transition to index.
                    this.context.router.transitionTo('index');
                } else {
                    // Parse and process data.
                    var data = response.body,
                        results = shareBill(this.getData(data.data));

                    // Set person data and settings.
                    PersonActions.setPersons(data.data);
                    SettingActions.setCurrency(data.currency);

                    // Show results.
                    PersonActions.shareTotal(results);
                }
            }.bind(this));
        }
    },
    componentWillUnmount: function () {
        // Detach event listeners.
        window.removeEventListener('keydown', this.handleKeyDown);
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

        // Only process data if it's valid.
        if (!this.state.validation.valid) {
            return;
        }

        var results = shareBill(this.getData(this.state.persons.personList));

        PersonActions.shareTotal(results);
    },
    saveBill: function (event) {
        if (event) {
            event.preventDefault();
        }

        // Only save data if it's valid.
        if (!this.state.validation.valid || Object.keys(this.state.persons.payments).length === 0) {
            return;
        }

        // Get router and current bill ID.
        var router = this.context.router,
            bid = router.getCurrentParams().bid,
            // If there's bill ID, use PUT to update data. Otherwise, just POST to save new.
            url = bid ? '/api/v1/bill/' + bid : '/api/v1/bill',
            method = bid ? request.put(url) : request.post(url);

        method
        .send({data: this.state.persons.personList, currency: this.state.settings.currency})
        .end(function (error, response) {
            if (!bid) {
                // If bill ID does not exist, get one from results.
                SettingActions.setBid(response.body.bid);
                router.transitionTo('bill', {bid: response.body.bid});
            }
        }.bind(this));
    },
    deleteBill: function (event) {
        if (event) {
            event.preventDefault();
        }

        var router = this.context.router,
            bid = router.getCurrentParams().bid;

        request
        .del('/api/v1/bill/' + bid)
        .end(function (error, response) {
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

        // Loop through person data.
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
    handleKeyDown: function (event) {
        if (event.ctrlKey || event.metaKey) {
            // Handle CTRL+s combinations.
            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    this.saveBill();
                    break;
            }
        } else if (event.keyCode === 13) {
            // Handle ENTER keys.
            event.preventDefault();
            this.shareTotal();
        }
    },
    render: function () {
        var disabled = this.state.validation.valid ? undefined : 'disabled',
            saveButton =
            function () {
                if (Object.keys(this.state.persons.payments).length > 0) {
                    return (
                        <button className='btn btn-sm btn-primary' onClick={this.saveBill} disabled={disabled}><i className='fa fa-floppy-o'></i><span className='hidden-xs'> Save bill</span></button>
                    );
                }
            }.bind(this),
            deleteButton =
            function () {
                var bid = this.context.router.getCurrentParams().bid;
                if (bid) {
                    return (
                        <button className='btn btn-sm btn-primary' onClick={this.deleteBill}><i className='fa fa-trash-o'></i><span className='hidden-xs'> Delete bill</span></button>
                    );
                }
            }.bind(this);

        return (
            <div>
                <Settings />
                <PersonList />
                <div className='buttons main'>
                    <button className='btn btn-sm btn-primary' onClick={this.addPerson}><i className='fa fa-user-plus'></i><span className='hidden-xs'> Add person</span></button>
                    <button className='btn btn-sm btn-primary settings' onClick={this.toggleSettings}><i className='fa fa-cog'></i><span className='hidden-xs'> Settings</span></button>
                    <button className='btn btn-sm btn-primary' onClick={this.shareTotal} disabled={disabled}><i className='fa fa-calculator'></i><span className='hidden-xs'> Share total</span></button>
                </div>
                <PaymentList />
                <div className='col-xs-12 buttons'>
                    {saveButton()}
                    {deleteButton()}
                </div>
            </div>
        );
    }
});
