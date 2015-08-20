(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Reflux = require('reflux');

var PersonActions = Reflux.createActions([
    'addPerson',
    'editPerson',
    'deletePerson',
    'shareTotal',
    'setPersons',
    'reset'
]);

module.exports = PersonActions;

},{"reflux":"reflux"}],2:[function(require,module,exports){
var Reflux = require('reflux');

var SettingActions = Reflux.createActions([
    'toggleVisibility',
    'setCurrency',
    'setBid',
    'reset'
]);

module.exports = SettingActions;

},{"reflux":"reflux"}],3:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var PaymentWrapper = require('./components/paymentwrapper.jsx');

var routes = (
    React.createElement(Route, {handler: PaymentWrapper}, 
        React.createElement(Route, {name: "index", path: "/", handler: PaymentWrapper}), 
        React.createElement(Route, {name: "bill", path: "/:bid", handler: PaymentWrapper})
    )
);

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.getElementById('wrapper'));
});

},{"./components/paymentwrapper.jsx":6,"react":"react","react-router":"react-router"}],4:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;

module.exports = React.createClass({displayName: "exports",
    mixins: [IntlMixin],
    render: function() {
        return (
            React.createElement("div", {className: "paymentList__transaction clearfix col-md-12"}, 
                React.createElement("div", {className: "col-xs-3 col-md-4 transaction__amount"}, 
                    React.createElement(FormattedNumber, {value: this.props.amount, style: "currency", currency: "EUR"})
                ), 
                React.createElement("div", {className: "col-xs-9 col-md-8"}, 
                    React.createElement("i", {className: "fa fa-long-arrow-right"}), " ", this.props.to
                )
            )
        );
    }
});

},{"react":"react","react-intl":"react-intl"}],5:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var Payment = require('./payment.jsx');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var PersonStore = require('../stores/personstore.js');
var SettingStore = require('../stores/settingstore.js');

var _map = require('lodash.map');

module.exports = React.createClass({displayName: "exports",
    mixins: [
        IntlMixin,
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings')
    ],
    render: function() {
        var payments = _map(this.state.persons.payments, function(payment, i) {
            var personsPayments = payment.to.map(function(p, j) {
                return (
                    React.createElement(Payment, {key: j, to: p.to, amount: p.amount})
                );
            });

            return (
                React.createElement("div", {key: i, className: "paymentList__payment clearfix"}, 
                    React.createElement("div", {className: "paymentList__from"}, payment.name), 
                    React.createElement("div", {className: "paymentList__transactions clearfix bg-primary"}, 
                        personsPayments
                    )
                )
            );
        });

        return (
            React.createElement("div", {id: "paymentList"}, 
                React.createElement("div", {className: "stats"}, 
                    React.createElement("b", null, "Total: "), " ", React.createElement(FormattedNumber, {value: this.state.persons.total, style: "currency", currency: this.state.settings.currency}), " ", React.createElement("br", null), 
                    React.createElement("b", null, "Share: "), " ", React.createElement(FormattedNumber, {value: this.state.persons.share, style: "currency", currency: this.state.settings.currency}), " ", React.createElement("br", null)
                ), 
                payments
            )
        );
    }
});

},{"../stores/personstore.js":11,"../stores/settingstore.js":12,"./payment.jsx":4,"lodash.map":"lodash.map","react":"react","react-intl":"react-intl","reflux":"reflux"}],6:[function(require,module,exports){
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

module.exports = React.createClass({displayName: "exports",
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
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.deleteBill}, React.createElement("i", {className: "fa fa-trash-o"}), React.createElement("span", {className: "hidden-xs"}, " Delete"))
                );
            }
        }.bind(this);

        return (
            React.createElement("div", null, 
                React.createElement(Settings, null), 
                React.createElement("div", {className: "col-xs-8"}, 
                    React.createElement(PersonList, null), 
                    React.createElement("div", {id: "buttons", className: "col-xs-12"}, 
                        React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.addPerson}, React.createElement("i", {className: "fa fa-user-plus"}), React.createElement("span", {className: "hidden-xs"}, " Add person")), 
                        React.createElement("button", {className: "btn btn-lg btn-primary settings", onClick: this.toggleSettings}, React.createElement("i", {className: "fa fa-cog"}), React.createElement("span", {className: "hidden-xs"}, " Settings")), 
                        React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.shareTotal}, React.createElement("i", {className: "fa fa-calculator"}), React.createElement("span", {className: "hidden-xs"}, " Share total")), 
                        deleteButton()
                    )
                ), 
                React.createElement("div", {className: "col-xs-4"}, 
                    React.createElement(PaymentList, null)
                )
            )
        );
    }
});

},{"../actions/personactions.js":1,"../actions/settingactions.js":2,"../functions.js":10,"../stores/personstore.js":11,"../stores/settingstore.js":12,"./paymentlist.jsx":5,"./personlist.jsx":8,"./settings.jsx":9,"browser-request":"browser-request","react":"react","react-router":"react-router","reflux":"reflux"}],7:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var PersonActions = require('../actions/personactions.js');
var PersonStore = require('../stores/personstore.js');
var SettingStore = require('../stores/settingstore.js');

module.exports = React.createClass({displayName: "exports",
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
                    React.createElement("div", {className: "col-xs-1"}, 
                        React.createElement("button", {className: "btn btn-primary btn-sm btn-remove", onClick: this.handleDelete, tabIndex: "-1"}, React.createElement("i", {className: "fa fa-minus"}))
                    )
                );
            }
        }.bind(this);

        return (
            React.createElement("div", {className: "personList__person clearfix"}, 
                React.createElement("div", {className: "person__name col-xs-4"}, 
                    React.createElement("input", {type: "text", className: "form-control input-lg", placeholder: this.props.person.name, value: this.setName(), onChange: this.handleChange.bind(this, 'name'), autoFocus: true})
                ), 
                React.createElement("div", {className: "person__paid col-xs-6"}, 
                    React.createElement("div", {className: "input-group"}, 
                        React.createElement("input", {type: "tel", className: "form-control input-lg", placeholder: this.props.person.paid, value: this.setPaid(), onChange: this.handleChange.bind(this, 'paid')}), 
                        React.createElement("div", {className: "input-group-addon"}, this.state.settings.currency)
                    )
                ), 
                deleteButton()
            )
        );
    }
});

},{"../actions/personactions.js":1,"../stores/personstore.js":11,"../stores/settingstore.js":12,"react":"react","reflux":"reflux"}],8:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react/addons');
var Reflux = require('reflux');
var Person = require('./person.jsx');
var PersonStore = require('../stores/personstore.js');
var request = require('browser-request');

module.exports = React.createClass({displayName: "exports",
    mixins: [Reflux.connect(PersonStore, 'persons')],
    render: function() {
        var persons = '';
        if (this.state.persons.personList) {
            persons = this.state.persons.personList.map(function(person, i) {
                return (
                    React.createElement(Person, {key: i, idx: i, person: person})
                );
            }.bind(this));
        }

        return (
            React.createElement("form", {id: "personList"}, 
                persons, 
                React.createElement("div", {id: "help", className: "col-xs-12"}, "Protip: you can enter multiple amounts for person by separating them by space!")
            )

        );
    }
});

},{"../stores/personstore.js":11,"./person.jsx":7,"browser-request":"browser-request","react/addons":"react/addons","reflux":"reflux"}],9:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var Reflux = require('reflux');
var SettingActions = require('../actions/settingactions.js');
var SettingStore = require('../stores/settingstore.js');

module.exports = React.createClass({displayName: "exports",
    mixins: [Reflux.connect(SettingStore, 'settings')],
    setCurrency: function(event) {
        SettingActions.setCurrency(event.target.value);
    },
    render: function() {
        var isVisible = function() {
            return this.state.settings.visible ? 'form-horizontal col-xs-12' : 'hidden';
        }.bind(this);

        return (
            React.createElement("form", {id: "settings", className: isVisible()}, 
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("label", {htmlFor: "currency"}, "Currency"), 
                    React.createElement("select", {id: "currency", className: "form-control input-lg", onChange: this.setCurrency}, 
                        React.createElement("option", {value: "EUR"}, "EUR"), 
                        React.createElement("option", {value: "USD"}, "USD")
                    )
                )
            )
        );
    }
});

},{"../actions/settingactions.js":2,"../stores/settingstore.js":12,"react":"react","reflux":"reflux"}],10:[function(require,module,exports){
var _sortBy = require('lodash.sortby');
var _each = require('lodash.foreach');
var _reduce = require('lodash.reduce');
var _find = require('lodash.find');
var _remove = require('lodash.remove');

var round = function(num) {
    return +(Math.round(num + "e+2")  + "e-2");
};

/**
 * @param {Array} Array of object with keys name and paid.
 * @return {Array} Array of objects with payment details.
 */
module.exports = function(data) {
    var sorted, total, share, payments;

    // Remove invalid persons.
    _remove(data, function(person) {
       return !person.name || person.name.length === 0;
    });

    // Sort data by paid amount and then reverse.
    sorted = _sortBy(data, 'paid').reverse();

    // Add ID for each person.
    _each(sorted, function(person, idx) {
       person.id = idx;
       person.paid = Math.round(Number(person.paid * 100));
    });

    // Calculate total amount.
    total = _reduce(sorted, function(total, person) {
        return total + person.paid;
    }, 0);

    // Calculate share per person.
    share = sorted.length > 0 ? Math.round(Number(total / sorted.length)) : 0;

    // Object for storing results.
    payments = {};

    // Loop through persons.
    _each(sorted, function(person) {
        // Calcaulate how much person still has to pay (or receive, if the amount is negative).
        person.left = Math.round(share - person.paid);

        var target;

        // Loop until person has paid enough.
        while (person.left > 0) {
            payments[person.id] = payments[person.id] || {name: person.name, to: []};

            // Find the first person who is to receive money.
            target = _find(sorted, function(p) {
               return p.left < 0;
            });

            // Payment receiver found.
            if (target) {
                /* Check if paying person has more money than receiver.
                 * If paying has more than receiver, the amount to pay equals the amount receiver is to get.
                 * If paying has less than receiver, the amount to pay is rest of payers debt.
                 */
                var amount = Math.abs(target.left) > person.left ? person.left : Math.abs(target.left);

                // Add to receiver, subtract from payer.
                target.left += amount;
                person.left -= amount;

                // Push details for returning.
                payments[person.id].to.push({
                    to: target.name,
                    amount: Number(amount / 100)
                });
            } else {
                // Could not find any person who still shoud receive money.
                // This happens when total won't divide equally.
                person.left = 0;
            }
        }
    });

    // Return payments and other details.
    return {payments: payments, total: Number(total / 100), share: Number(share / 100)};
};

},{"lodash.find":"lodash.find","lodash.foreach":"lodash.foreach","lodash.reduce":"lodash.reduce","lodash.remove":"lodash.remove","lodash.sortby":"lodash.sortby"}],11:[function(require,module,exports){
var Reflux = require('reflux');
var PersonActions = require('../actions/personactions.js');

var Data = function() {
    return {
        personList: [],
        payments: {},
        total: 0,
        share: 0
    }
};

var PersonStore = Reflux.createStore({
    listenables: [PersonActions],
    persons: new Data(),
    init: function() {
        this.addPerson();
    },
    getInitialState: function() {
        return this.persons;
    },
    addPerson: function() {
        this.persons.personList.push({
            name: 'John Doe',
            paid: '0',
            pristine: true
        });
        this.trigger(this.persons);
    },
    editPerson: function(field, value, idx) {
        this.persons.personList[idx][field] = value;
        if (this.persons.personList[idx].pristine) {
            delete this.persons.personList[idx].pristine;
        }
        this.trigger(this.persons);
    },
    deletePerson: function(idx) {
        this.persons.personList.splice(idx, 1);
        this.trigger(this.persons);
    },
    shareTotal: function(results) {
        this.persons.payments = results.payments;
        this.persons.total = results.total;
        this.persons.share = results.share;
        this.trigger(this.persons);
    },
    setPersons: function(persons) {
        this.persons.personList = persons;
        this.trigger(this.persons);
    },
    reset: function() {
        this.persons = new Data();
        this.addPerson();
        this.trigger(this.persons);
    }
});

module.exports = PersonStore;

},{"../actions/personactions.js":1,"reflux":"reflux"}],12:[function(require,module,exports){
var Reflux = require('reflux');
var SettingActions = require('../actions/settingactions.js');

var Settings = function() {
    return {
        visible: false,
        currency: 'EUR',
        bid: undefined
    }
};

var SettingStore = Reflux.createStore({
    listenables: [SettingActions],
    settings: new Settings(),
    getInitialState: function() {
        return this.settings;
    },
    toggleVisibility: function() {
        this.settings.visible = !this.settings.visible;
        this.trigger(this.settings);
    },
    setCurrency: function(currency) {
        this.settings.currency = currency;
        this.trigger(this.settings);
    },
    setBid: function(bid) {
        this.settings.bid = bid;
        this.trigger(this.settings);
    },
    reset: function() {
        this.settings = new Settings();
        this.trigger(this.settings);
    }
});

module.exports = SettingStore;

},{"../actions/settingactions.js":2,"reflux":"reflux"}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYXBwLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGF5bWVudC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50bGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50d3JhcHBlci5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wZXJzb24uanN4IiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29ubGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9zZXR0aW5ncy5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvZnVuY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL3N0b3Jlcy9wZXJzb25zdG9yZS5qcyIsIi92YXIvd3d3L2Rldi9iaWxsZXIvY2xpZW50L3NyYy9qcy9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUvQixJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxD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YXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcblxudmFyIFBlcnNvbkFjdGlvbnMgPSBSZWZsdXguY3JlYXRlQWN0aW9ucyhbXG4gICAgJ2FkZFBlcnNvbicsXG4gICAgJ2VkaXRQZXJzb24nLFxuICAgICdkZWxldGVQZXJzb24nLFxuICAgICdzaGFyZVRvdGFsJyxcbiAgICAnc2V0UGVyc29ucycsXG4gICAgJ3Jlc2V0J1xuXSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uQWN0aW9uczsiLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG5cbnZhciBTZXR0aW5nQWN0aW9ucyA9IFJlZmx1eC5jcmVhdGVBY3Rpb25zKFtcbiAgICAndG9nZ2xlVmlzaWJpbGl0eScsXG4gICAgJ3NldEN1cnJlbmN5JyxcbiAgICAnc2V0QmlkJyxcbiAgICAncmVzZXQnXG5dKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nQWN0aW9uczsiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xudmFyIFJvdXRlID0gUm91dGVyLlJvdXRlO1xudmFyIFBheW1lbnRXcmFwcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCcpO1xuXG52YXIgcm91dGVzID0gKFxuICAgIDxSb3V0ZSBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiaW5kZXhcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiYmlsbFwiIHBhdGg9XCIvOmJpZFwiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgPC9Sb3V0ZT5cbik7XG5cblJvdXRlci5ydW4ocm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXBwZXInKSk7XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbSW50bE1peGluXSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X190cmFuc2FjdGlvbiBjbGVhcmZpeCBjb2wtbWQtMTInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMyBjb2wtbWQtNCB0cmFuc2FjdGlvbl9fYW1vdW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5wcm9wcy5hbW91bnR9IHN0eWxlPVwiY3VycmVuY3lcIiBjdXJyZW5jeT1cIkVVUlwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy05IGNvbC1tZC04Jz5cbiAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPSdmYSBmYS1sb25nLWFycm93LXJpZ2h0Jz48L2k+IHt0aGlzLnByb3BzLnRvfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpO1xudmFyIFBheW1lbnQgPSByZXF1aXJlKCcuL3BheW1lbnQuanN4Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcbnZhciBQZXJzb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZXJzb25zdG9yZS5qcycpO1xudmFyIFNldHRpbmdTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zZXR0aW5nc3RvcmUuanMnKTtcblxudmFyIF9tYXAgPSByZXF1aXJlKCdsb2Rhc2gubWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW1xuICAgICAgICBJbnRsTWl4aW4sXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFBlcnNvblN0b3JlLCAncGVyc29ucycpLFxuICAgICAgICBSZWZsdXguY29ubmVjdChTZXR0aW5nU3RvcmUsICdzZXR0aW5ncycpXG4gICAgXSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGF5bWVudHMgPSBfbWFwKHRoaXMuc3RhdGUucGVyc29ucy5wYXltZW50cywgZnVuY3Rpb24ocGF5bWVudCwgaSkge1xuICAgICAgICAgICAgdmFyIHBlcnNvbnNQYXltZW50cyA9IHBheW1lbnQudG8ubWFwKGZ1bmN0aW9uKHAsIGopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8UGF5bWVudCBrZXk9e2p9IHRvPXtwLnRvfSBhbW91bnQ9e3AuYW1vdW50fSAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPSdwYXltZW50TGlzdF9fcGF5bWVudCBjbGVhcmZpeCc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYXltZW50TGlzdF9fZnJvbSc+e3BheW1lbnQubmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X190cmFuc2FjdGlvbnMgY2xlYXJmaXggYmctcHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cGVyc29uc1BheW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGlkPSdwYXltZW50TGlzdCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3N0YXRzJz5cbiAgICAgICAgICAgICAgICAgICAgPGI+VG90YWw6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5zdGF0ZS5wZXJzb25zLnRvdGFsfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGI+U2hhcmU6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5zdGF0ZS5wZXJzb25zLnNoYXJlfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7cGF5bWVudHN9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgUGVyc29uTGlzdCA9IHJlcXVpcmUoJy4vcGVyc29ubGlzdC5qc3gnKTtcbnZhciBQYXltZW50TGlzdCA9IHJlcXVpcmUoJy4vcGF5bWVudGxpc3QuanN4Jyk7XG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzLmpzeCcpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xudmFyIFBlcnNvbkFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3BlcnNvbmFjdGlvbnMuanMnKTtcbnZhciBTZXR0aW5nQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMnKTtcbnZhciBQZXJzb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZXJzb25zdG9yZS5qcycpO1xudmFyIFNldHRpbmdTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zZXR0aW5nc3RvcmUuanMnKTtcblxudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdicm93c2VyLXJlcXVlc3QnKTtcbnZhciBzaGFyZUJpbGwgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFBlcnNvblN0b3JlLCAncGVyc29ucycpLFxuICAgICAgICBSZWZsdXguY29ubmVjdChTZXR0aW5nU3RvcmUsICdzZXR0aW5ncycpXG4gICAgXSxcbiAgICBjb250ZXh0VHlwZXM6IHtcbiAgICAgICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW47XG4gICAgICAgIHZhciBiaWQgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG4gICAgICAgIGlmIChiaWQpIHtcbiAgICAgICAgICAgIHJlcXVlc3QoYmFzZVVybCArICcvYXBpL3YxL2JpbGwvJyArIGJpZCwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgICAgICAgIFBlcnNvbkFjdGlvbnMuc2V0UGVyc29ucyhkYXRhLmRhdGEpO1xuICAgICAgICAgICAgICAgIFNldHRpbmdBY3Rpb25zLnNldEN1cnJlbmN5KGRhdGEuY3VycmVuY3kpO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHRzID0gc2hhcmVCaWxsKHRoaXMuZ2V0RGF0YShkYXRhLmRhdGEpKTtcbiAgICAgICAgICAgICAgICBQZXJzb25BY3Rpb25zLnNoYXJlVG90YWwocmVzdWx0cyk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFBlcnNvbkFjdGlvbnMuYWRkUGVyc29uKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTZXR0aW5nczogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgU2V0dGluZ0FjdGlvbnMudG9nZ2xlVmlzaWJpbGl0eSgpO1xuICAgIH0sXG4gICAgc2hhcmVUb3RhbDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSBzaGFyZUJpbGwodGhpcy5nZXREYXRhKHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0KSk7XG4gICAgICAgIFBlcnNvbkFjdGlvbnMuc2hhcmVUb3RhbChyZXN1bHRzKTtcblxuICAgICAgICB2YXIgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW47XG4gICAgICAgIHZhciByb3V0ZXIgPSB0aGlzLmNvbnRleHQucm91dGVyO1xuICAgICAgICB2YXIgYmlkID0gcm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG4gICAgICAgIHZhciBtZXRob2QgPSBiaWQgPyAnUFVUJyA6ICdQT1NUJztcbiAgICAgICAgdmFyIHVybCA9IGJpZCA/ICcvYmlsbC8nICsgYmlkIDogJy9iaWxsJztcblxuICAgICAgICByZXF1ZXN0KHt1cmw6IGJhc2VVcmwgKyAnL2FwaS92MScgKyB1cmwsIG1ldGhvZDogbWV0aG9kLCBib2R5OiB7ZGF0YTogdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QsIGN1cnJlbmN5OiB0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSwganNvbjogdHJ1ZX0sIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICAgICAgaWYgKCFiaWQpIHtcbiAgICAgICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5zZXRCaWQoYm9keS5iaWQpO1xuICAgICAgICAgICAgICAgIHJvdXRlci50cmFuc2l0aW9uVG8oJ2JpbGwnLCB7YmlkOiBib2R5LmJpZH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkZWxldGVCaWxsOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW47XG4gICAgICAgIHZhciByb3V0ZXIgPSB0aGlzLmNvbnRleHQucm91dGVyO1xuICAgICAgICB2YXIgYmlkID0gcm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG5cbiAgICAgICAgcmVxdWVzdCh7dXJsOiBiYXNlVXJsICsgJy9hcGkvdjEvYmlsbC8nICsgYmlkLCBtZXRob2Q6ICdERUxFVEUnfSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICBQZXJzb25BY3Rpb25zLnJlc2V0KCk7XG4gICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5yZXNldCgpO1xuICAgICAgICAgICAgcm91dGVyLnRyYW5zaXRpb25UbygnaW5kZXgnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIGdldERhdGE6IGZ1bmN0aW9uKHBlcnNvbnMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgcGVyc29uQ291bnQgPSBwZXJzb25zLmxlbmd0aDtcbiAgICAgICAgdmFyIHBlcnNvbjtcbiAgICAgICAgdmFyIHBhaWQ7XG4gICAgICAgIGZvciAoOyBpIDwgcGVyc29uQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgcGVyc29uID0gcGVyc29uc1tpXTtcbiAgICAgICAgICAgIC8vIFN1bSBhbW91bnRzIGlmIG11bHRpcGxlIGdpdmVuLiBBbHNvIHJlcGxhY2UgY29tbWFzLlxuICAgICAgICAgICAgcGFpZCA9IHR5cGVvZiBwZXJzb24ucGFpZCA9PT0gJ3N0cmluZycgPyBwZXJzb24ucGFpZC5zcGxpdCgnICcpLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihwcmV2KSArIE51bWJlcihjdXJyZW50LnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgICAgIH0sIDApIDogcGVyc29uLnBhaWQ7XG4gICAgICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHBlcnNvbi5uYW1lLFxuICAgICAgICAgICAgICAgIHBhaWQ6IE51bWJlcihwYWlkKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWxldGVCdXR0b24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBiaWQgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG4gICAgICAgICAgICBpZiAoYmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tbGcgYnRuLXByaW1hcnknIG9uQ2xpY2s9e3RoaXMuZGVsZXRlQmlsbH0+PGkgY2xhc3NOYW1lPSdmYSBmYS10cmFzaC1vJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBEZWxldGU8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxTZXR0aW5ncyAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtOCc+XG4gICAgICAgICAgICAgICAgICAgIDxQZXJzb25MaXN0IC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9J2J1dHRvbnMnIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLmFkZFBlcnNvbn0+PGkgY2xhc3NOYW1lPSdmYSBmYS11c2VyLXBsdXMnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IEFkZCBwZXJzb248L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1sZyBidG4tcHJpbWFyeSBzZXR0aW5ncycgb25DbGljaz17dGhpcy50b2dnbGVTZXR0aW5nc30+PGkgY2xhc3NOYW1lPSdmYSBmYS1jb2cnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IFNldHRpbmdzPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tbGcgYnRuLXByaW1hcnknIG9uQ2xpY2s9e3RoaXMuc2hhcmVUb3RhbH0+PGkgY2xhc3NOYW1lPSdmYSBmYS1jYWxjdWxhdG9yJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBTaGFyZSB0b3RhbDwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtkZWxldGVCdXR0b24oKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy00Jz5cbiAgICAgICAgICAgICAgICAgICAgPFBheW1lbnRMaXN0IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgUGVyc29uQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvcGVyc29uYWN0aW9ucy5qcycpO1xudmFyIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyk7XG52YXIgU2V0dGluZ1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3NldHRpbmdzdG9yZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoUGVyc29uU3RvcmUsICdwZXJzb25zJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFNldHRpbmdTdG9yZSwgJ3NldHRpbmdzJyksXG4gICAgXSxcbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGZpZWxkLCBldmVudCkge1xuICAgICAgICBQZXJzb25BY3Rpb25zLmVkaXRQZXJzb24oZmllbGQsIGV2ZW50LnRhcmdldC52YWx1ZSwgdGhpcy5wcm9wcy5pZHgpO1xuICAgIH0sXG4gICAgaGFuZGxlRGVsZXRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgUGVyc29uQWN0aW9ucy5kZWxldGVQZXJzb24odGhpcy5wcm9wcy5pZHgsIGV2ZW50KTtcbiAgICB9LFxuICAgIHNldE5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5wZXJzb24ucHJpc3RpbmUgPyB1bmRlZmluZWQgOiB0aGlzLnByb3BzLnBlcnNvbi5uYW1lO1xuICAgIH0sXG4gICAgc2V0UGFpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnBlcnNvbi5wcmlzdGluZSA/IHVuZGVmaW5lZCA6IHRoaXMucHJvcHMucGVyc29uLnBhaWQ7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGVsZXRlQnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QgJiYgdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMSc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBidG4tcmVtb3ZlJyBvbkNsaWNrPXt0aGlzLmhhbmRsZURlbGV0ZX0gdGFiSW5kZXg9Jy0xJz48aSBjbGFzc05hbWU9J2ZhIGZhLW1pbnVzJz48L2k+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbkxpc3RfX3BlcnNvbiBjbGVhcmZpeCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbl9fbmFtZSBjb2wteHMtNCc+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGVyc29uLm5hbWV9IHZhbHVlPXt0aGlzLnNldE5hbWUoKX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ25hbWUnKX0gYXV0b0ZvY3VzIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbl9fcGFpZCBjb2wteHMtNic+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdpbnB1dC1ncm91cCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGVsJyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGVyc29uLnBhaWR9IHZhbHVlPXt0aGlzLnNldFBhaWQoKX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3BhaWQnKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj57dGhpcy5zdGF0ZS5zZXR0aW5ncy5jdXJyZW5jeX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge2RlbGV0ZUJ1dHRvbigpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpO1xudmFyIFBlcnNvbiA9IHJlcXVpcmUoJy4vcGVyc29uLmpzeCcpO1xudmFyIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ2Jyb3dzZXItcmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtSZWZsdXguY29ubmVjdChQZXJzb25TdG9yZSwgJ3BlcnNvbnMnKV0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBlcnNvbnMgPSAnJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0KSB7XG4gICAgICAgICAgICBwZXJzb25zID0gdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QubWFwKGZ1bmN0aW9uKHBlcnNvbiwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxQZXJzb24ga2V5PXtpfSBpZHg9e2l9IHBlcnNvbj17cGVyc29ufSAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtIGlkPSdwZXJzb25MaXN0Jz5cbiAgICAgICAgICAgICAgICB7cGVyc29uc31cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdoZWxwJyBjbGFzc05hbWU9J2NvbC14cy0xMic+UHJvdGlwOiB5b3UgY2FuIGVudGVyIG11bHRpcGxlIGFtb3VudHMgZm9yIHBlcnNvbiBieSBzZXBhcmF0aW5nIHRoZW0gYnkgc3BhY2UhPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcbnZhciBTZXR0aW5nQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMnKTtcbnZhciBTZXR0aW5nU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW1JlZmx1eC5jb25uZWN0KFNldHRpbmdTdG9yZSwgJ3NldHRpbmdzJyldLFxuICAgIHNldEN1cnJlbmN5OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBTZXR0aW5nQWN0aW9ucy5zZXRDdXJyZW5jeShldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzVmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2V0dGluZ3MudmlzaWJsZSA/ICdmb3JtLWhvcml6b250YWwgY29sLXhzLTEyJyA6ICdoaWRkZW4nO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtIGlkPSdzZXR0aW5ncycgY2xhc3NOYW1lPXtpc1Zpc2libGUoKX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2Zvcm0tZ3JvdXAnPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj0nY3VycmVuY3knPkN1cnJlbmN5PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nY3VycmVuY3knIGNsYXNzTmFtZT0nZm9ybS1jb250cm9sIGlucHV0LWxnJyBvbkNoYW5nZT17dGhpcy5zZXRDdXJyZW5jeX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdFVVInPkVVUjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nVVNEJz5VU0Q8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCJ2YXIgX3NvcnRCeSA9IHJlcXVpcmUoJ2xvZGFzaC5zb3J0YnknKTtcbnZhciBfZWFjaCA9IHJlcXVpcmUoJ2xvZGFzaC5mb3JlYWNoJyk7XG52YXIgX3JlZHVjZSA9IHJlcXVpcmUoJ2xvZGFzaC5yZWR1Y2UnKTtcbnZhciBfZmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5maW5kJyk7XG52YXIgX3JlbW92ZSA9IHJlcXVpcmUoJ2xvZGFzaC5yZW1vdmUnKTtcblxudmFyIHJvdW5kID0gZnVuY3Rpb24obnVtKSB7XG4gICAgcmV0dXJuICsoTWF0aC5yb3VuZChudW0gKyBcImUrMlwiKSAgKyBcImUtMlwiKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtBcnJheX0gQXJyYXkgb2Ygb2JqZWN0IHdpdGgga2V5cyBuYW1lIGFuZCBwYWlkLlxuICogQHJldHVybiB7QXJyYXl9IEFycmF5IG9mIG9iamVjdHMgd2l0aCBwYXltZW50IGRldGFpbHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBzb3J0ZWQsIHRvdGFsLCBzaGFyZSwgcGF5bWVudHM7XG5cbiAgICAvLyBSZW1vdmUgaW52YWxpZCBwZXJzb25zLlxuICAgIF9yZW1vdmUoZGF0YSwgZnVuY3Rpb24ocGVyc29uKSB7XG4gICAgICAgcmV0dXJuICFwZXJzb24ubmFtZSB8fCBwZXJzb24ubmFtZS5sZW5ndGggPT09IDA7XG4gICAgfSk7XG5cbiAgICAvLyBTb3J0IGRhdGEgYnkgcGFpZCBhbW91bnQgYW5kIHRoZW4gcmV2ZXJzZS5cbiAgICBzb3J0ZWQgPSBfc29ydEJ5KGRhdGEsICdwYWlkJykucmV2ZXJzZSgpO1xuXG4gICAgLy8gQWRkIElEIGZvciBlYWNoIHBlcnNvbi5cbiAgICBfZWFjaChzb3J0ZWQsIGZ1bmN0aW9uKHBlcnNvbiwgaWR4KSB7XG4gICAgICAgcGVyc29uLmlkID0gaWR4O1xuICAgICAgIHBlcnNvbi5wYWlkID0gTWF0aC5yb3VuZChOdW1iZXIocGVyc29uLnBhaWQgKiAxMDApKTtcbiAgICB9KTtcblxuICAgIC8vIENhbGN1bGF0ZSB0b3RhbCBhbW91bnQuXG4gICAgdG90YWwgPSBfcmVkdWNlKHNvcnRlZCwgZnVuY3Rpb24odG90YWwsIHBlcnNvbikge1xuICAgICAgICByZXR1cm4gdG90YWwgKyBwZXJzb24ucGFpZDtcbiAgICB9LCAwKTtcblxuICAgIC8vIENhbGN1bGF0ZSBzaGFyZSBwZXIgcGVyc29uLlxuICAgIHNoYXJlID0gc29ydGVkLmxlbmd0aCA+IDAgPyBNYXRoLnJvdW5kKE51bWJlcih0b3RhbCAvIHNvcnRlZC5sZW5ndGgpKSA6IDA7XG5cbiAgICAvLyBPYmplY3QgZm9yIHN0b3JpbmcgcmVzdWx0cy5cbiAgICBwYXltZW50cyA9IHt9O1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIHBlcnNvbnMuXG4gICAgX2VhY2goc29ydGVkLCBmdW5jdGlvbihwZXJzb24pIHtcbiAgICAgICAgLy8gQ2FsY2F1bGF0ZSBob3cgbXVjaCBwZXJzb24gc3RpbGwgaGFzIHRvIHBheSAob3IgcmVjZWl2ZSwgaWYgdGhlIGFtb3VudCBpcyBuZWdhdGl2ZSkuXG4gICAgICAgIHBlcnNvbi5sZWZ0ID0gTWF0aC5yb3VuZChzaGFyZSAtIHBlcnNvbi5wYWlkKTtcblxuICAgICAgICB2YXIgdGFyZ2V0O1xuXG4gICAgICAgIC8vIExvb3AgdW50aWwgcGVyc29uIGhhcyBwYWlkIGVub3VnaC5cbiAgICAgICAgd2hpbGUgKHBlcnNvbi5sZWZ0ID4gMCkge1xuICAgICAgICAgICAgcGF5bWVudHNbcGVyc29uLmlkXSA9IHBheW1lbnRzW3BlcnNvbi5pZF0gfHwge25hbWU6IHBlcnNvbi5uYW1lLCB0bzogW119O1xuXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBmaXJzdCBwZXJzb24gd2hvIGlzIHRvIHJlY2VpdmUgbW9uZXkuXG4gICAgICAgICAgICB0YXJnZXQgPSBfZmluZChzb3J0ZWQsIGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgIHJldHVybiBwLmxlZnQgPCAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFBheW1lbnQgcmVjZWl2ZXIgZm91bmQuXG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgLyogQ2hlY2sgaWYgcGF5aW5nIHBlcnNvbiBoYXMgbW9yZSBtb25leSB0aGFuIHJlY2VpdmVyLlxuICAgICAgICAgICAgICAgICAqIElmIHBheWluZyBoYXMgbW9yZSB0aGFuIHJlY2VpdmVyLCB0aGUgYW1vdW50IHRvIHBheSBlcXVhbHMgdGhlIGFtb3VudCByZWNlaXZlciBpcyB0byBnZXQuXG4gICAgICAgICAgICAgICAgICogSWYgcGF5aW5nIGhhcyBsZXNzIHRoYW4gcmVjZWl2ZXIsIHRoZSBhbW91bnQgdG8gcGF5IGlzIHJlc3Qgb2YgcGF5ZXJzIGRlYnQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdmFyIGFtb3VudCA9IE1hdGguYWJzKHRhcmdldC5sZWZ0KSA+IHBlcnNvbi5sZWZ0ID8gcGVyc29uLmxlZnQgOiBNYXRoLmFicyh0YXJnZXQubGVmdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgdG8gcmVjZWl2ZXIsIHN1YnRyYWN0IGZyb20gcGF5ZXIuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmxlZnQgKz0gYW1vdW50O1xuICAgICAgICAgICAgICAgIHBlcnNvbi5sZWZ0IC09IGFtb3VudDtcblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggZGV0YWlscyBmb3IgcmV0dXJuaW5nLlxuICAgICAgICAgICAgICAgIHBheW1lbnRzW3BlcnNvbi5pZF0udG8ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB0YXJnZXQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50OiBOdW1iZXIoYW1vdW50IC8gMTAwKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDb3VsZCBub3QgZmluZCBhbnkgcGVyc29uIHdobyBzdGlsbCBzaG91ZCByZWNlaXZlIG1vbmV5LlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIHRvdGFsIHdvbid0IGRpdmlkZSBlcXVhbGx5LlxuICAgICAgICAgICAgICAgIHBlcnNvbi5sZWZ0ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIHBheW1lbnRzIGFuZCBvdGhlciBkZXRhaWxzLlxuICAgIHJldHVybiB7cGF5bWVudHM6IHBheW1lbnRzLCB0b3RhbDogTnVtYmVyKHRvdGFsIC8gMTAwKSwgc2hhcmU6IE51bWJlcihzaGFyZSAvIDEwMCl9O1xufTsiLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgUGVyc29uQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvcGVyc29uYWN0aW9ucy5qcycpO1xuXG52YXIgRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBlcnNvbkxpc3Q6IFtdLFxuICAgICAgICBwYXltZW50czoge30sXG4gICAgICAgIHRvdGFsOiAwLFxuICAgICAgICBzaGFyZTogMFxuICAgIH1cbn07XG5cbnZhciBQZXJzb25TdG9yZSA9IFJlZmx1eC5jcmVhdGVTdG9yZSh7XG4gICAgbGlzdGVuYWJsZXM6IFtQZXJzb25BY3Rpb25zXSxcbiAgICBwZXJzb25zOiBuZXcgRGF0YSgpLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmFkZFBlcnNvbigpO1xuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVyc29ucztcbiAgICB9LFxuICAgIGFkZFBlcnNvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGVyc29ucy5wZXJzb25MaXN0LnB1c2goe1xuICAgICAgICAgICAgbmFtZTogJ0pvaG4gRG9lJyxcbiAgICAgICAgICAgIHBhaWQ6ICcwJyxcbiAgICAgICAgICAgIHByaXN0aW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5wZXJzb25zKTtcbiAgICB9LFxuICAgIGVkaXRQZXJzb246IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSwgaWR4KSB7XG4gICAgICAgIHRoaXMucGVyc29ucy5wZXJzb25MaXN0W2lkeF1bZmllbGRdID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnBlcnNvbnMucGVyc29uTGlzdFtpZHhdLnByaXN0aW5lKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wZXJzb25zLnBlcnNvbkxpc3RbaWR4XS5wcmlzdGluZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5wZXJzb25zKTtcbiAgICB9LFxuICAgIGRlbGV0ZVBlcnNvbjogZnVuY3Rpb24oaWR4KSB7XG4gICAgICAgIHRoaXMucGVyc29ucy5wZXJzb25MaXN0LnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5wZXJzb25zKTtcbiAgICB9LFxuICAgIHNoYXJlVG90YWw6IGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgdGhpcy5wZXJzb25zLnBheW1lbnRzID0gcmVzdWx0cy5wYXltZW50cztcbiAgICAgICAgdGhpcy5wZXJzb25zLnRvdGFsID0gcmVzdWx0cy50b3RhbDtcbiAgICAgICAgdGhpcy5wZXJzb25zLnNoYXJlID0gcmVzdWx0cy5zaGFyZTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgfSxcbiAgICBzZXRQZXJzb25zOiBmdW5jdGlvbihwZXJzb25zKSB7XG4gICAgICAgIHRoaXMucGVyc29ucy5wZXJzb25MaXN0ID0gcGVyc29ucztcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgfSxcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGVyc29ucyA9IG5ldyBEYXRhKCk7XG4gICAgICAgIHRoaXMuYWRkUGVyc29uKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcnNvblN0b3JlOyIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcbnZhciBTZXR0aW5nQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMnKTtcblxudmFyIFNldHRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgIGN1cnJlbmN5OiAnRVVSJyxcbiAgICAgICAgYmlkOiB1bmRlZmluZWRcbiAgICB9XG59O1xuXG52YXIgU2V0dGluZ1N0b3JlID0gUmVmbHV4LmNyZWF0ZVN0b3JlKHtcbiAgICBsaXN0ZW5hYmxlczogW1NldHRpbmdBY3Rpb25zXSxcbiAgICBzZXR0aW5nczogbmV3IFNldHRpbmdzKCksXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3M7XG4gICAgfSxcbiAgICB0b2dnbGVWaXNpYmlsaXR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy52aXNpYmxlID0gIXRoaXMuc2V0dGluZ3MudmlzaWJsZTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0sXG4gICAgc2V0Q3VycmVuY3k6IGZ1bmN0aW9uKGN1cnJlbmN5KSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuY3VycmVuY3kgPSBjdXJyZW5jeTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0sXG4gICAgc2V0QmlkOiBmdW5jdGlvbihiaWQpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5iaWQgPSBiaWQ7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICB9LFxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5zZXR0aW5ncyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ1N0b3JlOyJdfQ==
