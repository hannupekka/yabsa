(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Reflux = require('reflux'),
    PersonActions = Reflux.createActions([
        'addPerson',
        'editPerson',
        'deletePerson',
        'shareTotal',
        'setPersons',
        'reset'
    ]);

module.exports = PersonActions;

},{"reflux":31}],2:[function(require,module,exports){
var Reflux = require('reflux'),
    SettingActions = Reflux.createActions([
        'toggleVisibility',
        'setCurrency',
        'setBid',
        'reset'
    ]);

module.exports = SettingActions;

},{"reflux":31}],3:[function(require,module,exports){
var Reflux = require('reflux'),
    ValidateActions = Reflux.createActions([]);

module.exports = ValidateActions;

},{"reflux":31}],4:[function(require,module,exports){
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

},{"./components/paymentwrapper.jsx":7,"react":"react","react-router":"react-router"}],5:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react'),
    ReactIntl = require('react-intl'),
    IntlMixin = ReactIntl.IntlMixin,
    FormattedNumber = ReactIntl.FormattedNumber;

module.exports = React.createClass({displayName: "exports",
    mixins: [IntlMixin],
    render: function () {
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

},{"react":"react","react-intl":"react-intl"}],6:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    Payment = require('./payment.jsx'),
    ReactIntl = require('react-intl'),
    IntlMixin = ReactIntl.IntlMixin,
    FormattedNumber = ReactIntl.FormattedNumber,
    PersonStore = require('../stores/personstore.js'),
    SettingStore = require('../stores/settingstore.js'),
    map = require('lodash.map');

module.exports = React.createClass({displayName: "exports",
    mixins: [
        IntlMixin,
        Reflux.connect(PersonStore, 'persons'),
        Reflux.connect(SettingStore, 'settings')
    ],
    render: function () {
        var payments = map(this.state.persons.payments, function (payment, i) {
            var personsPayments = payment.to.map(function (p, j) {
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
                    React.createElement("b", null, "Total: "), " ", React.createElement(FormattedNumber, {value: 10.10, style: "currency", currency: this.state.settings.currency}), " ", React.createElement("br", null), 
                    React.createElement("b", null, "Share: "), " ", React.createElement(FormattedNumber, {value: this.state.persons.share, style: "currency", currency: this.state.settings.currency}), " ", React.createElement("br", null)
                ), 
                payments
            )
        );
    }
});

},{"../stores/personstore.js":12,"../stores/settingstore.js":13,"./payment.jsx":5,"lodash.map":"lodash.map","react":"react","react-intl":"react-intl","reflux":31}],7:[function(require,module,exports){
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

module.exports = React.createClass({displayName: "exports",
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
                        React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.deleteBill}, React.createElement("i", {className: "fa fa-trash-o"}), React.createElement("span", {className: "hidden-xs"}, " Delete"))
                    );
                }
            }.bind(this),
            disabled = this.state.validation.valid ? undefined : 'disabled';

        return (
            React.createElement("div", null, 
                React.createElement(Settings, null), 
                React.createElement("div", {className: "col-xs-8"}, 
                    React.createElement(PersonList, null), 
                    React.createElement("div", {id: "buttons", className: "col-xs-12"}, 
                        React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.addPerson}, React.createElement("i", {className: "fa fa-user-plus"}), React.createElement("span", {className: "hidden-xs"}, " Add person")), 
                        React.createElement("button", {className: "btn btn-sm btn-primary settings", onClick: this.toggleSettings}, React.createElement("i", {className: "fa fa-cog"}), React.createElement("span", {className: "hidden-xs"}, " Settings")), 
                        React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.shareTotal, disabled: disabled}, React.createElement("i", {className: "fa fa-calculator"}), React.createElement("span", {className: "hidden-xs"}, " Share total")), 
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

},{"../actions/personactions.js":1,"../actions/settingactions.js":2,"../functions.js":11,"../stores/personstore.js":12,"../stores/settingstore.js":13,"../stores/validatestore.js":14,"./paymentlist.jsx":6,"./personlist.jsx":9,"./settings.jsx":10,"browser-request":"browser-request","react":"react","react-router":"react-router","reflux":31}],8:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    PersonActions = require('../actions/personactions.js'),
    ValidateActions = require('../actions/validateactions.js'),
    PersonStore = require('../stores/personstore.js'),
    ValidateStore = require('../stores/validatestore.js'),
    SettingStore = require('../stores/settingstore.js'),
    classNames = require('classnames');

module.exports = React.createClass({displayName: "exports",
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
                    React.createElement("div", {className: "col-xs-1"}, 
                        React.createElement("button", {className: "btn btn-primary btn-sm btn-remove", onClick: this.handleDelete, tabIndex: "-1"}, React.createElement("i", {className: "fa fa-minus"}))
                    )
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
            React.createElement("div", {className: "personList__person clearfix"}, 
                React.createElement("div", {className: nameClasses}, 
                    React.createElement("input", {type: "text", className: "form-control input-lg", placeholder: "John Doe", value: this.setName(), onChange: this.handleChange.bind(this, 'name'), autoFocus: true})
                ), 
                React.createElement("div", {className: "person__paid col-xs-6"}, 
                    React.createElement("div", {className: paidClasses}, 
                        React.createElement("input", {type: "tel", className: "form-control input-lg", placeholder: "0", value: this.setPaid(), onChange: this.handleChange.bind(this, 'paid')}), 
                        React.createElement("div", {className: "input-group-addon"}, this.state.settings.currency)
                    )
                ), 
                deleteButton()
            )
        );
    }
});

},{"../actions/personactions.js":1,"../actions/validateactions.js":3,"../stores/personstore.js":12,"../stores/settingstore.js":13,"../stores/validatestore.js":14,"classnames":"classnames","react":"react","reflux":31}],9:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react/addons'),
    Reflux = require('reflux'),
    Person = require('./person.jsx'),
    PersonStore = require('../stores/personstore.js'),
    request = require('browser-request');

module.exports = React.createClass({displayName: "exports",
    mixins: [Reflux.connect(PersonStore, 'persons')],
    render: function () {
        var persons = '';
        if (this.state.persons.personList) {
            persons = this.state.persons.personList.map(function (person, i) {
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

},{"../stores/personstore.js":12,"./person.jsx":8,"browser-request":"browser-request","react/addons":"react/addons","reflux":31}],10:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react'),
    Reflux = require('reflux'),
    SettingActions = require('../actions/settingactions.js'),
    SettingStore = require('../stores/settingstore.js'),
    classNames = require('classnames');

module.exports = React.createClass({displayName: "exports",
    mixins: [Reflux.connect(SettingStore, 'settings')],
    setCurrency: function (event) {
        SettingActions.setCurrency(event.target.value);
    },
    render: function () {
        var classes = classNames({
            'form-horizontal': true,
            'col-xs-12': true,
            'hidden': !this.state.settings.visible
        });

        return (
            React.createElement("form", {id: "settings", className: classes}, 
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

},{"../actions/settingactions.js":2,"../stores/settingstore.js":13,"classnames":"classnames","react":"react","reflux":31}],11:[function(require,module,exports){
var sortBy = require('lodash.sortby');
var each = require('lodash.foreach');
var reduce = require('lodash.reduce');
var find = require('lodash.find');
var remove = require('lodash.remove');

/**
 * @param {Array} Array of object with keys name and paid.
 * @return {Array} Array of objects with payment details.
 */
module.exports = function (data) {
    var sorted, total, share, payments;

    // Remove invalid persons.
    remove(data, function (person) {
       return !person.name || person.name.length === 0;
    });

    // Sort data by paid amount and then reverse.
    sorted = sortBy(data, 'paid').reverse();

    // Add ID for each person.
    each(sorted, function (person, idx) {
       person.id = idx;
       person.paid = Math.round(Number(person.paid * 100));
    });

    // Calculate total amount.
    total = reduce(sorted, function (total, person) {
        return total + person.paid;
    }, 0);

    // Calculate share per person.
    share = sorted.length > 0 ? Math.round(Number(total / sorted.length)) : 0;

    // Object for storing results.
    payments = {};

    // Loop through persons.
    each(sorted, function (person) {
        // Calcaulate how much person still has to pay (or receive, if the amount is negative).
        person.left = Math.round(share - person.paid);

        var target;

        // Loop until person has paid enough.
        while (person.left > 0) {
            payments[person.id] = payments[person.id] || {name: person.name, to: []};

            // Find the first person who is to receive money.
            target = find(sorted, function (p) {
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

},{"lodash.find":"lodash.find","lodash.foreach":"lodash.foreach","lodash.reduce":"lodash.reduce","lodash.remove":"lodash.remove","lodash.sortby":"lodash.sortby"}],12:[function(require,module,exports){
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
            name: undefined,
            paid: undefined
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

},{"../actions/personactions.js":1,"reflux":31}],13:[function(require,module,exports){
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

},{"../actions/settingactions.js":2,"reflux":31}],14:[function(require,module,exports){
var Reflux = require('reflux');
var ValidateActions = require('../actions/validateactions.js');
var PersonStore = require('./personstore.js');

var ValidateStore = Reflux.createStore({
    listenables: [ValidateActions],
    results: {
        persons: [],
        valid: false
    },
    init: function() {
        this.listenTo(PersonStore, this.validateForm, this.validateInitialForm);
    },
    getInitialState: function() {
        return this.results;
    },
    validateInitialForm: function(persons) {
        this.results.persons = this.parsePersons(persons, true);
        this.trigger(this.results);
    },
    validateForm: function(persons) {
        this.results.persons = this.parsePersons(persons, false);

        this.results.valid = this.results.persons.every(function(person) {
            return person.name === true && person.paid === true;
        });

        this.trigger(this.results);
    },
    parsePersons: function(persons, initial) {
        return persons.personList.map(function(person, i) {
            var isNameValid = initial;
            var isPaidValid = initial;

            isNameValid = typeof person.name !== 'undefined' ? person.name.length > 0 : 'pristine';
            isPaidValid = typeof person.paid !== 'undefined' ? person.paid.match(/^[\d,. ]+$/) !== null : 'pristine';

            return {
                name: isNameValid,
                paid: isPaidValid
            }
        });
    }
});

module.exports = ValidateStore;

},{"../actions/validateactions.js":3,"./personstore.js":12,"reflux":31}],15:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],16:[function(require,module,exports){
/**
 * A module of methods that you want to include in all actions.
 * This module is consumed by `createAction`.
 */
"use strict";

module.exports = {};
},{}],17:[function(require,module,exports){
"use strict";

exports.createdStores = [];

exports.createdActions = [];

exports.reset = function () {
    while (exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while (exports.createdActions.length) {
        exports.createdActions.pop();
    }
};
},{}],18:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    maker = require("./joins").instanceJoinCreator;

/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function mapChildListenables(listenable) {
    var i = 0,
        children = {},
        childName;
    for (; i < (listenable.children || []).length; ++i) {
        childName = listenable.children[i];
        if (listenable[childName]) {
            children[childName] = listenable[childName];
        }
    }
    return children;
};

/**
 * Make a flat dictionary of all listenables including their
 * possible children (recursively), concatenating names in camelCase.
 *
 * @param {Object} listenables The top-level listenables
 */
var flattenListenables = function flattenListenables(listenables) {
    var flattened = {};
    for (var key in listenables) {
        var listenable = listenables[key];
        var childMap = mapChildListenables(listenable);

        // recursively flatten children
        var children = flattenListenables(childMap);

        // add the primary listenable and chilren
        flattened[key] = listenable;
        for (var childKey in children) {
            var childListenable = children[childKey];
            flattened[key + _.capitalize(childKey)] = childListenable;
        }
    }

    return flattened;
};

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function hasListener(listenable) {
        var i = 0,
            j,
            listener,
            listenables;
        for (; i < (this.subscriptions || []).length; ++i) {
            listenables = [].concat(this.subscriptions[i].listenable);
            for (j = 0; j < listenables.length; j++) {
                listener = listenables[j];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function listenToMany(listenables) {
        var allListenables = flattenListenables(listenables);
        for (var key in allListenables) {
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname) {
                this.listenTo(allListenables[key], localname, this[cbname + "Default"] || this[localname + "Default"] || localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function validateListening(listenable) {
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function listenTo(listenable, callback, defaultCallback) {
        var desub,
            unsubscriber,
            subscriptionobj,
            subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchInitialState(listenable, defaultCallback);
        desub = listenable.listen(this[callback] || callback, this);
        unsubscriber = function () {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1, "Tried to remove listen already gone from subscriptions list!");
            subs.splice(index, 1);
            desub();
        };
        subscriptionobj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function stopListeningTo(listenable) {
        var sub,
            i = 0,
            subs = this.subscriptions || [];
        for (; i < subs.length; i++) {
            sub = subs[i];
            if (sub.listenable === listenable) {
                sub.stop();
                _.throwIf(subs.indexOf(sub) !== -1, "Failed to remove listen from subscriptions list!");
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function stopListeningToAll() {
        var remaining,
            subs = this.subscriptions || [];
        while (remaining = subs.length) {
            subs[0].stop();
            _.throwIf(subs.length !== remaining - 1, "Failed to remove listen from subscriptions list!");
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchInitialState: function fetchInitialState(listenable, defaultCallback) {
        defaultCallback = defaultCallback && this[defaultCallback] || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {
            var data = listenable.getInitialState();
            if (data && _.isFunction(data.then)) {
                data.then(function () {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict: maker("strict")
};
},{"./joins":25,"./utils":27}],19:[function(require,module,exports){
"use strict";

var _ = require("./utils");

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function preEmit() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function shouldEmit() {
        return true;
    },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function listen(callback, bindContext) {
        bindContext = bindContext || this;
        var eventHandler = function eventHandler(args) {
            if (aborted) {
                return;
            }
            callback.apply(bindContext, args);
        },
            me = this,
            aborted = false;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function () {
            aborted = true;
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} The promise to attach to
     */
    promise: function promise(_promise) {
        var me = this;

        var canHandlePromise = this.children.indexOf("completed") >= 0 && this.children.indexOf("failed") >= 0;

        if (!canHandlePromise) {
            throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
        }

        _promise.then(function (response) {
            return me.completed(response);
        }, function (error) {
            return me.failed(error);
        });
    },

    /**
     * Subscribes the given callback for action triggered, which should
     * return a promise that in turn is passed to `this.promise`
     *
     * @param {Function} callback The callback to register as event handler
     */
    listenAndPromise: function listenAndPromise(callback, bindContext) {
        var me = this;
        bindContext = bindContext || this;
        this.willCallPromise = (this.willCallPromise || 0) + 1;

        var removeListen = this.listen(function () {

            if (!callback) {
                throw new Error("Expected a function returning a promise but got " + callback);
            }

            var args = arguments,
                promise = callback.apply(bindContext, args);
            return me.promise.call(me, promise);
        }, bindContext);

        return function () {
            me.willCallPromise--;
            removeListen.call(me);
        };
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function trigger() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function triggerAsync() {
        var args = arguments,
            me = this;
        _.nextTick(function () {
            me.trigger.apply(me, args);
        });
    },

    /**
     * Returns a Promise for the triggered action
     *
     * @return {Promise}
     *   Resolved by completed child action.
     *   Rejected by failed child action.
     *   If listenAndPromise'd, then promise associated to this trigger.
     *   Otherwise, the promise is for next child action completion.
     */
    triggerPromise: function triggerPromise() {
        var me = this;
        var args = arguments;

        var canHandlePromise = this.children.indexOf("completed") >= 0 && this.children.indexOf("failed") >= 0;

        var promise = _.createPromise(function (resolve, reject) {
            // If `listenAndPromise` is listening
            // patch `promise` w/ context-loaded resolve/reject
            if (me.willCallPromise) {
                _.nextTick(function () {
                    var previousPromise = me.promise;
                    me.promise = function (inputPromise) {
                        inputPromise.then(resolve, reject);
                        // Back to your regularly schedule programming.
                        me.promise = previousPromise;
                        return me.promise.apply(me, arguments);
                    };
                    me.trigger.apply(me, args);
                });
                return;
            }

            if (canHandlePromise) {
                var removeSuccess = me.completed.listen(function (argsArr) {
                    removeSuccess();
                    removeFailed();
                    resolve(argsArr);
                });

                var removeFailed = me.failed.listen(function (argsArr) {
                    removeSuccess();
                    removeFailed();
                    reject(argsArr);
                });
            }

            me.triggerAsync.apply(me, args);

            if (!canHandlePromise) {
                resolve();
            }
        });

        return promise;
    }
};
},{"./utils":27}],20:[function(require,module,exports){
/**
 * A module of methods that you want to include in all stores.
 * This module is consumed by `createStore`.
 */
"use strict";

module.exports = {};
},{}],21:[function(require,module,exports){
"use strict";

module.exports = function (store, definition) {
    for (var name in definition) {
        if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);

            if (!propertyDescriptor.value || typeof propertyDescriptor.value !== "function" || !definition.hasOwnProperty(name)) {
                continue;
            }

            store[name] = definition[name].bind(store);
        } else {
            var property = definition[name];

            if (typeof property !== "function" || !definition.hasOwnProperty(name)) {
                continue;
            }

            store[name] = property.bind(store);
        }
    }

    return store;
};
},{}],22:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    ActionMethods = require("./ActionMethods"),
    PublisherMethods = require("./PublisherMethods"),
    Keep = require("./Keep");

var allowed = { preEmit: 1, shouldEmit: 1 };

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
var createAction = function createAction(definition) {

    definition = definition || {};
    if (!_.isObject(definition)) {
        definition = { actionName: definition };
    }

    for (var a in ActionMethods) {
        if (!allowed[a] && PublisherMethods[a]) {
            throw new Error("Cannot override API method " + a + " in Reflux.ActionMethods. Use another method name or override it on Reflux.PublisherMethods instead.");
        }
    }

    for (var d in definition) {
        if (!allowed[d] && PublisherMethods[d]) {
            throw new Error("Cannot override API method " + d + " in action creation. Use another method name or override it on Reflux.PublisherMethods instead.");
        }
    }

    definition.children = definition.children || [];
    if (definition.asyncResult) {
        definition.children = definition.children.concat(["completed", "failed"]);
    }

    var i = 0,
        childActions = {};
    for (; i < definition.children.length; i++) {
        var name = definition.children[i];
        childActions[name] = createAction(name);
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    }, PublisherMethods, ActionMethods, definition);

    var functor = function functor() {
        var triggerType = functor.sync ? "trigger" : _.environment.hasPromise ? "triggerPromise" : "triggerAsync";
        return functor[triggerType].apply(functor, arguments);
    };

    _.extend(functor, childActions, context);

    Keep.createdActions.push(functor);

    return functor;
};

module.exports = createAction;
},{"./ActionMethods":16,"./Keep":17,"./PublisherMethods":19,"./utils":27}],23:[function(require,module,exports){
"use strict";

var _ = require("./utils"),
    Keep = require("./Keep"),
    mixer = require("./mixer"),
    bindMethods = require("./bindMethods");

var allowed = { preEmit: 1, shouldEmit: 1 };

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function (definition) {

    var StoreMethods = require("./StoreMethods"),
        PublisherMethods = require("./PublisherMethods"),
        ListenerMethods = require("./ListenerMethods");

    definition = definition || {};

    for (var a in StoreMethods) {
        if (!allowed[a] && (PublisherMethods[a] || ListenerMethods[a])) {
            throw new Error("Cannot override API method " + a + " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }
    }

    for (var d in definition) {
        if (!allowed[d] && (PublisherMethods[d] || ListenerMethods[d])) {
            throw new Error("Cannot override API method " + d + " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }
    }

    definition = mixer(definition);

    function Store() {
        var i = 0,
            arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        bindMethods(this, definition);
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables) {
            arr = [].concat(this.listenables);
            for (; i < arr.length; i++) {
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, ListenerMethods, PublisherMethods, StoreMethods, definition);

    var store = new Store();
    Keep.createdStores.push(store);

    return store;
};
},{"./Keep":17,"./ListenerMethods":18,"./PublisherMethods":19,"./StoreMethods":20,"./bindMethods":21,"./mixer":26,"./utils":27}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Reflux = {
    version: {
        "reflux-core": "0.2.1"
    }
};

Reflux.ActionMethods = require("./ActionMethods");

Reflux.ListenerMethods = require("./ListenerMethods");

Reflux.PublisherMethods = require("./PublisherMethods");

Reflux.StoreMethods = require("./StoreMethods");

Reflux.createAction = require("./createAction");

Reflux.createStore = require("./createStore");

var maker = require("./joins").staticJoinCreator;

Reflux.joinTrailing = Reflux.all = maker("last"); // Reflux.all alias for backward compatibility

Reflux.joinLeading = maker("first");

Reflux.joinStrict = maker("strict");

Reflux.joinConcat = maker("all");

var _ = Reflux.utils = require("./utils");

Reflux.EventEmitter = _.EventEmitter;

Reflux.Promise = _.Promise;

/**
 * Convenience function for creating a set of actions
 *
 * @param definitions the definitions for the actions to be created
 * @returns an object with actions of corresponding action names
 */
Reflux.createActions = (function () {
    var reducer = function reducer(definitions, actions) {
        Object.keys(definitions).forEach(function (actionName) {
            var val = definitions[actionName];
            actions[actionName] = Reflux.createAction(val);
        });
    };

    return function (definitions) {
        var actions = {};
        if (definitions instanceof Array) {
            definitions.forEach(function (val) {
                if (_.isObject(val)) {
                    reducer(val, actions);
                } else {
                    actions[val] = Reflux.createAction(val);
                }
            });
        } else {
            reducer(definitions, actions);
        }
        return actions;
    };
})();

/**
 * Sets the eventmitter that Reflux uses
 */
Reflux.setEventEmitter = function (ctx) {
    Reflux.EventEmitter = _.EventEmitter = ctx;
};

/**
 * Sets the Promise library that Reflux uses
 */
Reflux.setPromise = function (ctx) {
    Reflux.Promise = _.Promise = ctx;
};

/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
Reflux.setPromiseFactory = function (factory) {
    _.createPromise = factory;
};

/**
 * Sets the method used for deferring actions and stores
 */
Reflux.nextTick = function (nextTick) {
    _.nextTick = nextTick;
};

Reflux.use = function (pluginCb) {
    pluginCb(Reflux);
};

/**
 * Provides the set of created actions and stores for introspection
 */
/*eslint-disable no-underscore-dangle*/
Reflux.__keep = require("./Keep");
/*eslint-enable no-underscore-dangle*/

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
    console.error("Function.prototype.bind not available. " + "ES5 shim required. " + "https://github.com/spoike/refluxjs#es5");
}

exports["default"] = Reflux;
module.exports = exports["default"];
},{"./ActionMethods":16,"./Keep":17,"./ListenerMethods":18,"./PublisherMethods":19,"./StoreMethods":20,"./createAction":22,"./createStore":23,"./joins":25,"./utils":27}],25:[function(require,module,exports){
/**
 * Internal module used to create static and instance join methods
 */

"use strict";

var createStore = require("./createStore"),
    _ = require("./utils");

var slice = Array.prototype.slice,
    strategyMethodNames = {
    strict: "joinStrict",
    first: "joinLeading",
    last: "joinTrailing",
    all: "joinConcat"
};

/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
exports.staticJoinCreator = function (strategy) {
    return function () /* listenables... */{
        var listenables = slice.call(arguments);
        return createStore({
            init: function init() {
                this[strategyMethodNames[strategy]].apply(this, listenables.concat("triggerAsync"));
            }
        });
    };
};

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
exports.instanceJoinCreator = function (strategy) {
    return function () /* listenables..., callback*/{
        _.throwIf(arguments.length < 2, "Cannot create a join with less than 2 listenables!");
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            join = {
            numberOfListenables: numberOfListenables,
            callback: this[callback] || callback,
            listener: this,
            strategy: strategy
        },
            i,
            cancels = [],
            subobj;
        for (i = 0; i < numberOfListenables; i++) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; i++) {
            cancels.push(listenables[i].listen(newListener(i, join), this));
        }
        reset(join);
        subobj = { listenable: listenables };
        subobj.stop = makeStopper(subobj, cancels, this);
        this.subscriptions = (this.subscriptions || []).concat(subobj);
        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj, cancels, context) {
    return function () {
        var i,
            subs = context.subscriptions,
            index = subs ? subs.indexOf(subobj) : -1;
        _.throwIf(index === -1, "Tried to remove join already gone from subscriptions list!");
        for (i = 0; i < cancels.length; i++) {
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i, join) {
    return function () {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]) {
            switch (join.strategy) {
                case "strict":
                    throw new Error("Strict join failed because listener triggered twice.");
                case "last":
                    join.args[i] = callargs;break;
                case "all":
                    join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = join.strategy === "all" ? [callargs] : callargs;
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; i++) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener, join.args);
    reset(join);
}
},{"./createStore":23,"./utils":27}],26:[function(require,module,exports){
"use strict";

var _ = require("./utils");

module.exports = function mix(def) {
    var composed = {
        init: [],
        preEmit: [],
        shouldEmit: []
    };

    var updated = (function mixDef(mixin) {
        var mixed = {};
        if (mixin.mixins) {
            mixin.mixins.forEach(function (subMixin) {
                _.extend(mixed, mixDef(subMixin));
            });
        }
        _.extend(mixed, mixin);
        Object.keys(composed).forEach(function (composable) {
            if (mixin.hasOwnProperty(composable)) {
                composed[composable].push(mixin[composable]);
            }
        });
        return mixed;
    })(def);

    if (composed.init.length > 1) {
        updated.init = function () {
            var args = arguments;
            composed.init.forEach(function (init) {
                init.apply(this, args);
            }, this);
        };
    }
    if (composed.preEmit.length > 1) {
        updated.preEmit = function () {
            return composed.preEmit.reduce((function (args, preEmit) {
                var newValue = preEmit.apply(this, args);
                return newValue === undefined ? args : [newValue];
            }).bind(this), arguments);
        };
    }
    if (composed.shouldEmit.length > 1) {
        updated.shouldEmit = function () {
            var args = arguments;
            return !composed.shouldEmit.some(function (shouldEmit) {
                return !shouldEmit.apply(this, args);
            }, this);
        };
    }
    Object.keys(composed).forEach(function (composable) {
        if (composed[composable].length === 1) {
            updated[composable] = composed[composable][0];
        }
    });

    return updated;
};
},{"./utils":27}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.capitalize = capitalize;
exports.callbackName = callbackName;
exports.isObject = isObject;
exports.extend = extend;
exports.isFunction = isFunction;
exports.object = object;
exports.isArguments = isArguments;
exports.throwIf = throwIf;

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function callbackName(string, prefix) {
    prefix = prefix || "on";
    return prefix + exports.capitalize(string);
}

var environment = {};

exports.environment = environment;
function checkEnv(target) {
    var flag = undefined;
    try {
        /*eslint-disable no-eval */
        if (eval(target)) {
            flag = true;
        }
        /*eslint-enable no-eval */
    } catch (e) {
        flag = false;
    }
    environment[callbackName(target, "has")] = flag;
}
checkEnv("setImmediate");
checkEnv("Promise");

/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */

function isObject(obj) {
    var type = typeof obj;
    return type === "function" || type === "object" && !!obj;
}

function extend(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
                Object.defineProperty(obj, prop, propertyDescriptor);
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
}

function isFunction(value) {
    return typeof value === "function";
}

exports.EventEmitter = require("eventemitter3");

if (environment.hasSetImmediate) {
    exports.nextTick = function (callback) {
        setImmediate(callback);
    };
} else {
    exports.nextTick = function (callback) {
        setTimeout(callback, 0);
    };
}

function object(keys, vals) {
    var o = {},
        i = 0;
    for (; i < keys.length; i++) {
        o[keys[i]] = vals[i];
    }
    return o;
}

if (environment.hasPromise) {
    exports.Promise = Promise;
    exports.createPromise = function (resolver) {
        return new exports.Promise(resolver);
    };
} else {
    exports.Promise = null;
    exports.createPromise = function () {};
}

function isArguments(value) {
    return typeof value === "object" && "callee" in value && typeof value.length === "number";
}

function throwIf(val, msg) {
    if (val) {
        throw Error(msg || val);
    }
}
},{"eventemitter3":15}],28:[function(require,module,exports){
var _ = require('reflux-core/lib/utils'),
    ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will
 * import everything this mixin contains!
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: ListenerMethods.stopListeningToAll

}, ListenerMethods);

},{"reflux-core/lib/ListenerMethods":18,"reflux-core/lib/utils":27}],29:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable,key){
    return {
        getInitialState: function(){
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (key === undefined) {
                return listenable.getInitialState();
            } else {
                return _.object([key],[listenable.getInitialState()]);
            }
        },
        componentDidMount: function(){
            _.extend(this,ListenerMethods);
            var me = this, cb = (key === undefined ? this.setState : function(v){
                if (typeof me.isMounted === "undefined" || me.isMounted() === true) {
                    me.setState(_.object([key],[v]));
                }
            });
            this.listenTo(listenable,cb);
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};

},{"./ListenerMixin":28,"reflux-core/lib/ListenerMethods":18,"reflux-core/lib/utils":27}],30:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable, key, filterFunc) {
    filterFunc = _.isFunction(key) ? key : filterFunc;
    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (_.isFunction(key)) {
                return filterFunc.call(this, listenable.getInitialState());
            } else {
                // Filter initial payload from store.
                var result = filterFunc.call(this, listenable.getInitialState());
                if (typeof(result) !== "undefined") {
                    return _.object([key], [result]);
                } else {
                    return {};
                }
            }
        },
        componentDidMount: function() {
            _.extend(this, ListenerMethods);
            var me = this;
            var cb = function(value) {
                if (_.isFunction(key)) {
                    me.setState(filterFunc.call(me, value));
                } else {
                    var result = filterFunc.call(me, value);
                    me.setState(_.object([key], [result]));
                }
            };

            this.listenTo(listenable, cb);
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};


},{"./ListenerMixin":28,"reflux-core/lib/ListenerMethods":18,"reflux-core/lib/utils":27}],31:[function(require,module,exports){
var Reflux = require('reflux-core');

Reflux.connect = require('./connect');

Reflux.connectFilter = require('./connectFilter');

Reflux.ListenerMixin = require('./ListenerMixin');

Reflux.listenTo = require('./listenTo');

Reflux.listenToMany = require('./listenToMany');

module.exports = Reflux;

},{"./ListenerMixin":28,"./connect":29,"./connectFilter":30,"./listenTo":32,"./listenToMany":33,"reflux-core":24}],32:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in ListenerMethods){
                if (this[m] !== ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = ListenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: ListenerMethods.stopListeningToAll
    };
};

},{"reflux-core/lib/ListenerMethods":18}],33:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in ListenerMethods){
                if (this[m] !== ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";
                    }
                    this[m] = ListenerMethods[m];
                }
            }
            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: ListenerMethods.stopListeningToAll
    };
};

},{"reflux-core/lib/ListenerMethods":18}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYWN0aW9ucy92YWxpZGF0ZWFjdGlvbnMuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYXBwLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGF5bWVudC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50bGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50d3JhcHBlci5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wZXJzb24uanN4IiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29ubGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9zZXR0aW5ncy5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvZnVuY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL3N0b3Jlcy9wZXJzb25zdG9yZS5qcyIsIi92YXIvd3d3L2Rldi9iaWxsZXIvY2xpZW50L3NyYy9qcy9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL3N0b3Jlcy92YWxpZGF0ZXN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9BY3Rpb25NZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL0tlZXAuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L25vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL1B1Ymxpc2hlck1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L25vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvU3RvcmVNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL2JpbmRNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL2NyZWF0ZUFjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9qb2lucy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9taXhlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL0xpc3RlbmVyTWl4aW4uanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9jb25uZWN0LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvY29ubmVjdEZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvbGlzdGVuVG8uanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9saXN0ZW5Ub01hbnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQzFCLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ2pDLFdBQVc7UUFDWCxZQUFZO1FBQ1osY0FBYztRQUNkLFlBQVk7UUFDWixZQUFZO1FBQ1osT0FBTztBQUNmLEtBQUssQ0FBQyxDQUFDOztBQUVQLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7QUNWL0IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUMxQixjQUFjLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUNsQyxrQkFBa0I7UUFDbEIsYUFBYTtRQUNiLFFBQVE7UUFDUixPQUFPO0FBQ2YsS0FBSyxDQUFDLENBQUM7O0FBRVAsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7OztBQ1JoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzlCLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRS9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDOzs7QUNIakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3pCLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFBlcnNvbkFjdGlvbnMgPSBSZWZsdXguY3JlYXRlQWN0aW9ucyhbXG4gICAgICAgICdhZGRQZXJzb24nLFxuICAgICAgICAnZWRpdFBlcnNvbicsXG4gICAgICAgICdkZWxldGVQZXJzb24nLFxuICAgICAgICAnc2hhcmVUb3RhbCcsXG4gICAgICAgICdzZXRQZXJzb25zJyxcbiAgICAgICAgJ3Jlc2V0J1xuICAgIF0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcnNvbkFjdGlvbnM7XG4iLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4JyksXG4gICAgU2V0dGluZ0FjdGlvbnMgPSBSZWZsdXguY3JlYXRlQWN0aW9ucyhbXG4gICAgICAgICd0b2dnbGVWaXNpYmlsaXR5JyxcbiAgICAgICAgJ3NldEN1cnJlbmN5JyxcbiAgICAgICAgJ3NldEJpZCcsXG4gICAgICAgICdyZXNldCdcbiAgICBdKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nQWN0aW9ucztcbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBWYWxpZGF0ZUFjdGlvbnMgPSBSZWZsdXguY3JlYXRlQWN0aW9ucyhbXSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsaWRhdGVBY3Rpb25zO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKCdyZWFjdC1yb3V0ZXInKTtcbnZhciBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcbnZhciBQYXltZW50V3JhcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9wYXltZW50d3JhcHBlci5qc3gnKTtcblxudmFyIHJvdXRlcyA9IChcbiAgICA8Um91dGUgaGFuZGxlcj17UGF5bWVudFdyYXBwZXJ9PlxuICAgICAgICA8Um91dGUgbmFtZT1cImluZGV4XCIgcGF0aD1cIi9cIiBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0vPlxuICAgICAgICA8Um91dGUgbmFtZT1cImJpbGxcIiBwYXRoPVwiLzpiaWRcIiBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0vPlxuICAgIDwvUm91dGU+XG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cmFwcGVyJykpO1xufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJlYWN0SW50bCA9IHJlcXVpcmUoJ3JlYWN0LWludGwnKSxcbiAgICBJbnRsTWl4aW4gPSBSZWFjdEludGwuSW50bE1peGluLFxuICAgIEZvcm1hdHRlZE51bWJlciA9IFJlYWN0SW50bC5Gb3JtYXR0ZWROdW1iZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW0ludGxNaXhpbl0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX3RyYW5zYWN0aW9uIGNsZWFyZml4IGNvbC1tZC0xMic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy0zIGNvbC1tZC00IHRyYW5zYWN0aW9uX19hbW91bnQnPlxuICAgICAgICAgICAgICAgICAgICA8Rm9ybWF0dGVkTnVtYmVyIHZhbHVlPXt0aGlzLnByb3BzLmFtb3VudH0gc3R5bGU9XCJjdXJyZW5jeVwiIGN1cnJlbmN5PVwiRVVSXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTkgY29sLW1kLTgnPlxuICAgICAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9J2ZhIGZhLWxvbmctYXJyb3ctcmlnaHQnPjwvaT4ge3RoaXMucHJvcHMudG99XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBQYXltZW50ID0gcmVxdWlyZSgnLi9wYXltZW50LmpzeCcpLFxuICAgIFJlYWN0SW50bCA9IHJlcXVpcmUoJ3JlYWN0LWludGwnKSxcbiAgICBJbnRsTWl4aW4gPSBSZWFjdEludGwuSW50bE1peGluLFxuICAgIEZvcm1hdHRlZE51bWJlciA9IFJlYWN0SW50bC5Gb3JtYXR0ZWROdW1iZXIsXG4gICAgUGVyc29uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcGVyc29uc3RvcmUuanMnKSxcbiAgICBTZXR0aW5nU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzJyksXG4gICAgbWFwID0gcmVxdWlyZSgnbG9kYXNoLm1hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtcbiAgICAgICAgSW50bE1peGluLFxuICAgICAgICBSZWZsdXguY29ubmVjdChQZXJzb25TdG9yZSwgJ3BlcnNvbnMnKSxcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoU2V0dGluZ1N0b3JlLCAnc2V0dGluZ3MnKVxuICAgIF0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwYXltZW50cyA9IG1hcCh0aGlzLnN0YXRlLnBlcnNvbnMucGF5bWVudHMsIGZ1bmN0aW9uIChwYXltZW50LCBpKSB7XG4gICAgICAgICAgICB2YXIgcGVyc29uc1BheW1lbnRzID0gcGF5bWVudC50by5tYXAoZnVuY3Rpb24gKHAsIGopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8UGF5bWVudCBrZXk9e2p9IHRvPXtwLnRvfSBhbW91bnQ9e3AuYW1vdW50fSAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPSdwYXltZW50TGlzdF9fcGF5bWVudCBjbGVhcmZpeCc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYXltZW50TGlzdF9fZnJvbSc+e3BheW1lbnQubmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X190cmFuc2FjdGlvbnMgY2xlYXJmaXggYmctcHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cGVyc29uc1BheW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGlkPSdwYXltZW50TGlzdCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3N0YXRzJz5cbiAgICAgICAgICAgICAgICAgICAgPGI+VG90YWw6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17MTAuMTB9IHN0eWxlPSdjdXJyZW5jeScgY3VycmVuY3k9e3RoaXMuc3RhdGUuc2V0dGluZ3MuY3VycmVuY3l9IC8+IDxiciAvPlxuICAgICAgICAgICAgICAgICAgICA8Yj5TaGFyZTogPC9iPiA8Rm9ybWF0dGVkTnVtYmVyIHZhbHVlPXt0aGlzLnN0YXRlLnBlcnNvbnMuc2hhcmV9IHN0eWxlPSdjdXJyZW5jeScgY3VycmVuY3k9e3RoaXMuc3RhdGUuc2V0dGluZ3MuY3VycmVuY3l9IC8+IDxiciAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtwYXltZW50c31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFBlcnNvbkxpc3QgPSByZXF1aXJlKCcuL3BlcnNvbmxpc3QuanN4JyksXG4gICAgUGF5bWVudExpc3QgPSByZXF1aXJlKCcuL3BheW1lbnRsaXN0LmpzeCcpLFxuICAgIFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncy5qc3gnKSxcbiAgICBSb3V0ZXIgPSByZXF1aXJlKCdyZWFjdC1yb3V0ZXInKSxcbiAgICBQZXJzb25BY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzJyksXG4gICAgU2V0dGluZ0FjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3NldHRpbmdhY3Rpb25zLmpzJyksXG4gICAgUGVyc29uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcGVyc29uc3RvcmUuanMnKSxcbiAgICBWYWxpZGF0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3ZhbGlkYXRlc3RvcmUuanMnKSxcbiAgICBTZXR0aW5nU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzJyksXG4gICAgcmVxdWVzdCA9IHJlcXVpcmUoJ2Jyb3dzZXItcmVxdWVzdCcpLFxuICAgIHNoYXJlQmlsbCA9IHJlcXVpcmUoJy4uL2Z1bmN0aW9ucy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoUGVyc29uU3RvcmUsICdwZXJzb25zJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFZhbGlkYXRlU3RvcmUsICd2YWxpZGF0aW9uJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFNldHRpbmdTdG9yZSwgJ3NldHRpbmdzJylcbiAgICBdLFxuICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICAgICAgICBiaWQgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG4gICAgICAgIGlmIChiaWQpIHtcbiAgICAgICAgICAgIHJlcXVlc3QoYmFzZVVybCArICcvYXBpL3YxL2JpbGwvJyArIGJpZCwgZnVuY3Rpb24gKGVycm9yLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJvdXRlci50cmFuc2l0aW9uVG8oJ2luZGV4Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGJvZHkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHNoYXJlQmlsbCh0aGlzLmdldERhdGEoZGF0YS5kYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbkFjdGlvbnMuc2V0UGVyc29ucyhkYXRhLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5zZXRDdXJyZW5jeShkYXRhLmN1cnJlbmN5KTtcbiAgICAgICAgICAgICAgICAgICAgUGVyc29uQWN0aW9ucy5zaGFyZVRvdGFsKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGFkZFBlcnNvbjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFBlcnNvbkFjdGlvbnMuYWRkUGVyc29uKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTZXR0aW5nczogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFNldHRpbmdBY3Rpb25zLnRvZ2dsZVZpc2liaWxpdHkoKTtcbiAgICB9LFxuICAgIHNoYXJlVG90YWw6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICAgICAgcm91dGVyID0gdGhpcy5jb250ZXh0LnJvdXRlcixcbiAgICAgICAgICAgIGJpZCA9IHJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkuYmlkLFxuICAgICAgICAgICAgbWV0aG9kID0gYmlkID8gJ1BVVCcgOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgPSBiaWQgPyAnL2JpbGwvJyArIGJpZCA6ICcvYmlsbCcsXG4gICAgICAgICAgICByZXN1bHRzID0gc2hhcmVCaWxsKHRoaXMuZ2V0RGF0YSh0aGlzLnN0YXRlLnBlcnNvbnMucGVyc29uTGlzdCkpO1xuXG4gICAgICAgIFBlcnNvbkFjdGlvbnMuc2hhcmVUb3RhbChyZXN1bHRzKTtcblxuICAgICAgICByZXF1ZXN0KHt1cmw6IGJhc2VVcmwgKyAnL2FwaS92MScgKyB1cmwsIG1ldGhvZDogbWV0aG9kLCBib2R5OiB7ZGF0YTogdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QsIGN1cnJlbmN5OiB0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSwganNvbjogdHJ1ZX0sIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgICAgICAgIGlmICghYmlkKSB7XG4gICAgICAgICAgICAgICAgU2V0dGluZ0FjdGlvbnMuc2V0QmlkKGJvZHkuYmlkKTtcbiAgICAgICAgICAgICAgICByb3V0ZXIudHJhbnNpdGlvblRvKCdiaWxsJywge2JpZDogYm9keS5iaWR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZGVsZXRlQmlsbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbixcbiAgICAgICAgICAgIHJvdXRlciA9IHRoaXMuY29udGV4dC5yb3V0ZXIsXG4gICAgICAgICAgICBiaWQgPSByb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmJpZDtcblxuICAgICAgICByZXF1ZXN0KHt1cmw6IGJhc2VVcmwgKyAnL2FwaS92MS9iaWxsLycgKyBiaWQsIG1ldGhvZDogJ0RFTEVURSd9LCBmdW5jdGlvbiAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICBQZXJzb25BY3Rpb25zLnJlc2V0KCk7XG4gICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5yZXNldCgpO1xuICAgICAgICAgICAgcm91dGVyLnRyYW5zaXRpb25UbygnaW5kZXgnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIGdldERhdGE6IGZ1bmN0aW9uIChwZXJzb25zKSB7XG4gICAgICAgIHZhciBkYXRhID0gW10sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIHBlcnNvbkNvdW50ID0gcGVyc29ucy5sZW5ndGgsXG4gICAgICAgICAgICBwZXJzb24sXG4gICAgICAgICAgICBwYWlkO1xuICAgICAgICBmb3IgKDsgaSA8IHBlcnNvbkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHBlcnNvbiA9IHBlcnNvbnNbaV07XG4gICAgICAgICAgICAvLyBTdW0gYW1vdW50cyBpZiBtdWx0aXBsZSBnaXZlbi4gQWxzbyByZXBsYWNlIGNvbW1hcy5cbiAgICAgICAgICAgIHBhaWQgPSB0eXBlb2YgcGVyc29uLnBhaWQgPT09ICdzdHJpbmcnID8gcGVyc29uLnBhaWQuc3BsaXQoJyAnKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHByZXYpICsgTnVtYmVyKGN1cnJlbnQucmVwbGFjZSgnLCcsICcuJykpO1xuICAgICAgICAgICAgfSwgMCkgOiBwZXJzb24ucGFpZDtcbiAgICAgICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogcGVyc29uLm5hbWUsXG4gICAgICAgICAgICAgICAgcGFpZDogTnVtYmVyKHBhaWQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkZWxldGVCdXR0b24gPVxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBiaWQgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQ7XG4gICAgICAgICAgICAgICAgaWYgKGJpZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tc20gYnRuLXByaW1hcnknIG9uQ2xpY2s9e3RoaXMuZGVsZXRlQmlsbH0+PGkgY2xhc3NOYW1lPSdmYSBmYS10cmFzaC1vJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBEZWxldGU8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZGlzYWJsZWQgPSB0aGlzLnN0YXRlLnZhbGlkYXRpb24udmFsaWQgPyB1bmRlZmluZWQgOiAnZGlzYWJsZWQnO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxTZXR0aW5ncyAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtOCc+XG4gICAgICAgICAgICAgICAgICAgIDxQZXJzb25MaXN0IC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9J2J1dHRvbnMnIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLmFkZFBlcnNvbn0+PGkgY2xhc3NOYW1lPSdmYSBmYS11c2VyLXBsdXMnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IEFkZCBwZXJzb248L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tcHJpbWFyeSBzZXR0aW5ncycgb25DbGljaz17dGhpcy50b2dnbGVTZXR0aW5nc30+PGkgY2xhc3NOYW1lPSdmYSBmYS1jb2cnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IFNldHRpbmdzPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tc20gYnRuLXByaW1hcnknIG9uQ2xpY2s9e3RoaXMuc2hhcmVUb3RhbH0gZGlzYWJsZWQ9e2Rpc2FibGVkfT48aSBjbGFzc05hbWU9J2ZhIGZhLWNhbGN1bGF0b3InPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IFNoYXJlIHRvdGFsPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAge2RlbGV0ZUJ1dHRvbigpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTQnPlxuICAgICAgICAgICAgICAgICAgICA8UGF5bWVudExpc3QgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFBlcnNvbkFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3BlcnNvbmFjdGlvbnMuanMnKSxcbiAgICBWYWxpZGF0ZUFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3ZhbGlkYXRlYWN0aW9ucy5qcycpLFxuICAgIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyksXG4gICAgVmFsaWRhdGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy92YWxpZGF0ZXN0b3JlLmpzJyksXG4gICAgU2V0dGluZ1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3NldHRpbmdzdG9yZS5qcycpLFxuICAgIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW1xuICAgICAgICBSZWZsdXguY29ubmVjdChQZXJzb25TdG9yZSwgJ3BlcnNvbnMnKSxcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoVmFsaWRhdGVTdG9yZSwgJ3ZhbGlkYXRpb24nKSxcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoU2V0dGluZ1N0b3JlLCAnc2V0dGluZ3MnKVxuICAgIF0sXG4gICAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbiAoZmllbGQsIGV2ZW50KSB7XG4gICAgICAgIFBlcnNvbkFjdGlvbnMuZWRpdFBlcnNvbihmaWVsZCwgZXZlbnQudGFyZ2V0LnZhbHVlLCB0aGlzLnByb3BzLmlkeCk7XG4gICAgfSxcbiAgICBoYW5kbGVEZWxldGU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgUGVyc29uQWN0aW9ucy5kZWxldGVQZXJzb24odGhpcy5wcm9wcy5pZHgsIGV2ZW50KTtcbiAgICB9LFxuICAgIHNldE5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMucGVyc29uLm5hbWU7XG4gICAgfSxcbiAgICBzZXRQYWlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnBlcnNvbi5wYWlkO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkZWxldGVCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QgJiYgdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMSc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBidG4tcmVtb3ZlJyBvbkNsaWNrPXt0aGlzLmhhbmRsZURlbGV0ZX0gdGFiSW5kZXg9Jy0xJz48aSBjbGFzc05hbWU9J2ZhIGZhLW1pbnVzJz48L2k+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgbmFtZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdwZXJzb25fX25hbWUnOiB0cnVlLFxuICAgICAgICAgICAgJ2NvbC14cy00JzogdHJ1ZSxcbiAgICAgICAgICAgICdoYXMtZXJyb3InOiAhdGhpcy5zdGF0ZS52YWxpZGF0aW9uLnBlcnNvbnNbdGhpcy5wcm9wcy5pZHhdLm5hbWVcbiAgICAgICAgfSksXG4gICAgICAgIHBhaWRDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnaW5wdXQtZ3JvdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2hhcy1lcnJvcic6ICF0aGlzLnN0YXRlLnZhbGlkYXRpb24ucGVyc29uc1t0aGlzLnByb3BzLmlkeF0ucGFpZFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbkxpc3RfX3BlcnNvbiBjbGVhcmZpeCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e25hbWVDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RleHQnIGNsYXNzTmFtZT0nZm9ybS1jb250cm9sIGlucHV0LWxnJyBwbGFjZWhvbGRlcj0nSm9obiBEb2UnIHZhbHVlPXt0aGlzLnNldE5hbWUoKX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ25hbWUnKX0gYXV0b0ZvY3VzIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbl9fcGFpZCBjb2wteHMtNic+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtwYWlkQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGVsJyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9JzAnIHZhbHVlPXt0aGlzLnNldFBhaWQoKX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3BhaWQnKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj57dGhpcy5zdGF0ZS5zZXR0aW5ncy5jdXJyZW5jeX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge2RlbGV0ZUJ1dHRvbigpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpLFxuICAgIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFBlcnNvbiA9IHJlcXVpcmUoJy4vcGVyc29uLmpzeCcpLFxuICAgIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyksXG4gICAgcmVxdWVzdCA9IHJlcXVpcmUoJ2Jyb3dzZXItcmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtSZWZsdXguY29ubmVjdChQZXJzb25TdG9yZSwgJ3BlcnNvbnMnKV0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwZXJzb25zID0gJyc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBlcnNvbnMucGVyc29uTGlzdCkge1xuICAgICAgICAgICAgcGVyc29ucyA9IHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0Lm1hcChmdW5jdGlvbiAocGVyc29uLCBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPFBlcnNvbiBrZXk9e2l9IGlkeD17aX0gcGVyc29uPXtwZXJzb259IC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm0gaWQ9J3BlcnNvbkxpc3QnPlxuICAgICAgICAgICAgICAgIHtwZXJzb25zfVxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J2hlbHAnIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5Qcm90aXA6IHlvdSBjYW4gZW50ZXIgbXVsdGlwbGUgYW1vdW50cyBmb3IgcGVyc29uIGJ5IHNlcGFyYXRpbmcgdGhlbSBieSBzcGFjZSE8L2Rpdj5cbiAgICAgICAgICAgIDwvZm9ybT5cblxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFNldHRpbmdBY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9zZXR0aW5nYWN0aW9ucy5qcycpLFxuICAgIFNldHRpbmdTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zZXR0aW5nc3RvcmUuanMnKSxcbiAgICBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtSZWZsdXguY29ubmVjdChTZXR0aW5nU3RvcmUsICdzZXR0aW5ncycpXSxcbiAgICBzZXRDdXJyZW5jeTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIFNldHRpbmdBY3Rpb25zLnNldEN1cnJlbmN5KGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdmb3JtLWhvcml6b250YWwnOiB0cnVlLFxuICAgICAgICAgICAgJ2NvbC14cy0xMic6IHRydWUsXG4gICAgICAgICAgICAnaGlkZGVuJzogIXRoaXMuc3RhdGUuc2V0dGluZ3MudmlzaWJsZVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm0gaWQ9J3NldHRpbmdzJyBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmb3JtLWdyb3VwJz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9J2N1cnJlbmN5Jz5DdXJyZW5jeTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2N1cnJlbmN5JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgb25DaGFuZ2U9e3RoaXMuc2V0Q3VycmVuY3l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nRVVSJz5FVVI8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J1VTRCc+VVNEPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwidmFyIHNvcnRCeSA9IHJlcXVpcmUoJ2xvZGFzaC5zb3J0YnknKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnbG9kYXNoLmZvcmVhY2gnKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdsb2Rhc2gucmVkdWNlJyk7XG52YXIgZmluZCA9IHJlcXVpcmUoJ2xvZGFzaC5maW5kJyk7XG52YXIgcmVtb3ZlID0gcmVxdWlyZSgnbG9kYXNoLnJlbW92ZScpO1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXl9IEFycmF5IG9mIG9iamVjdCB3aXRoIGtleXMgbmFtZSBhbmQgcGFpZC5cbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiBvYmplY3RzIHdpdGggcGF5bWVudCBkZXRhaWxzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHNvcnRlZCwgdG90YWwsIHNoYXJlLCBwYXltZW50cztcblxuICAgIC8vIFJlbW92ZSBpbnZhbGlkIHBlcnNvbnMuXG4gICAgcmVtb3ZlKGRhdGEsIGZ1bmN0aW9uIChwZXJzb24pIHtcbiAgICAgICByZXR1cm4gIXBlcnNvbi5uYW1lIHx8IHBlcnNvbi5uYW1lLmxlbmd0aCA9PT0gMDtcbiAgICB9KTtcblxuICAgIC8vIFNvcnQgZGF0YSBieSBwYWlkIGFtb3VudCBhbmQgdGhlbiByZXZlcnNlLlxuICAgIHNvcnRlZCA9IHNvcnRCeShkYXRhLCAncGFpZCcpLnJldmVyc2UoKTtcblxuICAgIC8vIEFkZCBJRCBmb3IgZWFjaCBwZXJzb24uXG4gICAgZWFjaChzb3J0ZWQsIGZ1bmN0aW9uIChwZXJzb24sIGlkeCkge1xuICAgICAgIHBlcnNvbi5pZCA9IGlkeDtcbiAgICAgICBwZXJzb24ucGFpZCA9IE1hdGgucm91bmQoTnVtYmVyKHBlcnNvbi5wYWlkICogMTAwKSk7XG4gICAgfSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgdG90YWwgYW1vdW50LlxuICAgIHRvdGFsID0gcmVkdWNlKHNvcnRlZCwgZnVuY3Rpb24gKHRvdGFsLCBwZXJzb24pIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgcGVyc29uLnBhaWQ7XG4gICAgfSwgMCk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc2hhcmUgcGVyIHBlcnNvbi5cbiAgICBzaGFyZSA9IHNvcnRlZC5sZW5ndGggPiAwID8gTWF0aC5yb3VuZChOdW1iZXIodG90YWwgLyBzb3J0ZWQubGVuZ3RoKSkgOiAwO1xuXG4gICAgLy8gT2JqZWN0IGZvciBzdG9yaW5nIHJlc3VsdHMuXG4gICAgcGF5bWVudHMgPSB7fTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBwZXJzb25zLlxuICAgIGVhY2goc29ydGVkLCBmdW5jdGlvbiAocGVyc29uKSB7XG4gICAgICAgIC8vIENhbGNhdWxhdGUgaG93IG11Y2ggcGVyc29uIHN0aWxsIGhhcyB0byBwYXkgKG9yIHJlY2VpdmUsIGlmIHRoZSBhbW91bnQgaXMgbmVnYXRpdmUpLlxuICAgICAgICBwZXJzb24ubGVmdCA9IE1hdGgucm91bmQoc2hhcmUgLSBwZXJzb24ucGFpZCk7XG5cbiAgICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgICAvLyBMb29wIHVudGlsIHBlcnNvbiBoYXMgcGFpZCBlbm91Z2guXG4gICAgICAgIHdoaWxlIChwZXJzb24ubGVmdCA+IDApIHtcbiAgICAgICAgICAgIHBheW1lbnRzW3BlcnNvbi5pZF0gPSBwYXltZW50c1twZXJzb24uaWRdIHx8IHtuYW1lOiBwZXJzb24ubmFtZSwgdG86IFtdfTtcblxuICAgICAgICAgICAgLy8gRmluZCB0aGUgZmlyc3QgcGVyc29uIHdobyBpcyB0byByZWNlaXZlIG1vbmV5LlxuICAgICAgICAgICAgdGFyZ2V0ID0gZmluZChzb3J0ZWQsIGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAubGVmdCA8IDA7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUGF5bWVudCByZWNlaXZlciBmb3VuZC5cbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvKiBDaGVjayBpZiBwYXlpbmcgcGVyc29uIGhhcyBtb3JlIG1vbmV5IHRoYW4gcmVjZWl2ZXIuXG4gICAgICAgICAgICAgICAgICogSWYgcGF5aW5nIGhhcyBtb3JlIHRoYW4gcmVjZWl2ZXIsIHRoZSBhbW91bnQgdG8gcGF5IGVxdWFscyB0aGUgYW1vdW50IHJlY2VpdmVyIGlzIHRvIGdldC5cbiAgICAgICAgICAgICAgICAgKiBJZiBwYXlpbmcgaGFzIGxlc3MgdGhhbiByZWNlaXZlciwgdGhlIGFtb3VudCB0byBwYXkgaXMgcmVzdCBvZiBwYXllcnMgZGVidC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50ID0gTWF0aC5hYnModGFyZ2V0LmxlZnQpID4gcGVyc29uLmxlZnQgPyBwZXJzb24ubGVmdCA6IE1hdGguYWJzKHRhcmdldC5sZWZ0KTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCB0byByZWNlaXZlciwgc3VidHJhY3QgZnJvbSBwYXllci5cbiAgICAgICAgICAgICAgICB0YXJnZXQubGVmdCArPSBhbW91bnQ7XG4gICAgICAgICAgICAgICAgcGVyc29uLmxlZnQgLT0gYW1vdW50O1xuXG4gICAgICAgICAgICAgICAgLy8gUHVzaCBkZXRhaWxzIGZvciByZXR1cm5pbmcuXG4gICAgICAgICAgICAgICAgcGF5bWVudHNbcGVyc29uLmlkXS50by5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdG86IHRhcmdldC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IE51bWJlcihhbW91bnQgLyAxMDApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENvdWxkIG5vdCBmaW5kIGFueSBwZXJzb24gd2hvIHN0aWxsIHNob3VkIHJlY2VpdmUgbW9uZXkuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gdG90YWwgd29uJ3QgZGl2aWRlIGVxdWFsbHkuXG4gICAgICAgICAgICAgICAgcGVyc29uLmxlZnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gcGF5bWVudHMgYW5kIG90aGVyIGRldGFpbHMuXG4gICAgcmV0dXJuIHtwYXltZW50czogcGF5bWVudHMsIHRvdGFsOiBOdW1iZXIodG90YWwgLyAxMDApLCBzaGFyZTogTnVtYmVyKHNoYXJlIC8gMTAwKX07XG59O1xuIiwidmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpO1xudmFyIFBlcnNvbkFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3BlcnNvbmFjdGlvbnMuanMnKTtcblxudmFyIERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwZXJzb25MaXN0OiBbXSxcbiAgICAgICAgcGF5bWVudHM6IHt9LFxuICAgICAgICB0b3RhbDogMCxcbiAgICAgICAgc2hhcmU6IDBcbiAgICB9XG59O1xuXG52YXIgUGVyc29uU3RvcmUgPSBSZWZsdXguY3JlYXRlU3RvcmUoe1xuICAgIGxpc3RlbmFibGVzOiBbUGVyc29uQWN0aW9uc10sXG4gICAgcGVyc29uczogbmV3IERhdGEoKSxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRQZXJzb24oKTtcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcnNvbnM7XG4gICAgfSxcbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBlcnNvbnMucGVyc29uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBhaWQ6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgfSxcbiAgICBlZGl0UGVyc29uOiBmdW5jdGlvbihmaWVsZCwgdmFsdWUsIGlkeCkge1xuICAgICAgICB0aGlzLnBlcnNvbnMucGVyc29uTGlzdFtpZHhdW2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5wZXJzb25zLnBlcnNvbkxpc3RbaWR4XS5wcmlzdGluZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVyc29ucy5wZXJzb25MaXN0W2lkeF0ucHJpc3RpbmU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgfSxcbiAgICBkZWxldGVQZXJzb246IGZ1bmN0aW9uKGlkeCkge1xuICAgICAgICB0aGlzLnBlcnNvbnMucGVyc29uTGlzdC5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgfSxcbiAgICBzaGFyZVRvdGFsOiBmdW5jdGlvbihyZXN1bHRzKSB7XG4gICAgICAgIHRoaXMucGVyc29ucy5wYXltZW50cyA9IHJlc3VsdHMucGF5bWVudHM7XG4gICAgICAgIHRoaXMucGVyc29ucy50b3RhbCA9IHJlc3VsdHMudG90YWw7XG4gICAgICAgIHRoaXMucGVyc29ucy5zaGFyZSA9IHJlc3VsdHMuc2hhcmU7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgIH0sXG4gICAgc2V0UGVyc29uczogZnVuY3Rpb24ocGVyc29ucykge1xuICAgICAgICB0aGlzLnBlcnNvbnMucGVyc29uTGlzdCA9IHBlcnNvbnM7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgIH0sXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBlcnNvbnMgPSBuZXcgRGF0YSgpO1xuICAgICAgICB0aGlzLmFkZFBlcnNvbigpO1xuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5wZXJzb25zKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQZXJzb25TdG9yZTsiLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgU2V0dGluZ0FjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3NldHRpbmdhY3Rpb25zLmpzJyk7XG5cbnZhciBTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICBjdXJyZW5jeTogJ0VVUicsXG4gICAgICAgIGJpZDogdW5kZWZpbmVkXG4gICAgfVxufTtcblxudmFyIFNldHRpbmdTdG9yZSA9IFJlZmx1eC5jcmVhdGVTdG9yZSh7XG4gICAgbGlzdGVuYWJsZXM6IFtTZXR0aW5nQWN0aW9uc10sXG4gICAgc2V0dGluZ3M6IG5ldyBTZXR0aW5ncygpLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzO1xuICAgIH0sXG4gICAgdG9nZ2xlVmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MudmlzaWJsZSA9ICF0aGlzLnNldHRpbmdzLnZpc2libGU7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICB9LFxuICAgIHNldEN1cnJlbmN5OiBmdW5jdGlvbihjdXJyZW5jeSkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmN1cnJlbmN5ID0gY3VycmVuY3k7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICB9LFxuICAgIHNldEJpZDogZnVuY3Rpb24oYmlkKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuYmlkID0gYmlkO1xuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5zZXR0aW5ncyk7XG4gICAgfSxcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMuc2V0dGluZ3MpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdTdG9yZTsiLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgVmFsaWRhdGVBY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy92YWxpZGF0ZWFjdGlvbnMuanMnKTtcbnZhciBQZXJzb25TdG9yZSA9IHJlcXVpcmUoJy4vcGVyc29uc3RvcmUuanMnKTtcblxudmFyIFZhbGlkYXRlU3RvcmUgPSBSZWZsdXguY3JlYXRlU3RvcmUoe1xuICAgIGxpc3RlbmFibGVzOiBbVmFsaWRhdGVBY3Rpb25zXSxcbiAgICByZXN1bHRzOiB7XG4gICAgICAgIHBlcnNvbnM6IFtdLFxuICAgICAgICB2YWxpZDogZmFsc2VcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3RlblRvKFBlcnNvblN0b3JlLCB0aGlzLnZhbGlkYXRlRm9ybSwgdGhpcy52YWxpZGF0ZUluaXRpYWxGb3JtKTtcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHM7XG4gICAgfSxcbiAgICB2YWxpZGF0ZUluaXRpYWxGb3JtOiBmdW5jdGlvbihwZXJzb25zKSB7XG4gICAgICAgIHRoaXMucmVzdWx0cy5wZXJzb25zID0gdGhpcy5wYXJzZVBlcnNvbnMocGVyc29ucywgdHJ1ZSk7XG4gICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnJlc3VsdHMpO1xuICAgIH0sXG4gICAgdmFsaWRhdGVGb3JtOiBmdW5jdGlvbihwZXJzb25zKSB7XG4gICAgICAgIHRoaXMucmVzdWx0cy5wZXJzb25zID0gdGhpcy5wYXJzZVBlcnNvbnMocGVyc29ucywgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMucmVzdWx0cy52YWxpZCA9IHRoaXMucmVzdWx0cy5wZXJzb25zLmV2ZXJ5KGZ1bmN0aW9uKHBlcnNvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBlcnNvbi5uYW1lID09PSB0cnVlICYmIHBlcnNvbi5wYWlkID09PSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5yZXN1bHRzKTtcbiAgICB9LFxuICAgIHBhcnNlUGVyc29uczogZnVuY3Rpb24ocGVyc29ucywgaW5pdGlhbCkge1xuICAgICAgICByZXR1cm4gcGVyc29ucy5wZXJzb25MaXN0Lm1hcChmdW5jdGlvbihwZXJzb24sIGkpIHtcbiAgICAgICAgICAgIHZhciBpc05hbWVWYWxpZCA9IGluaXRpYWw7XG4gICAgICAgICAgICB2YXIgaXNQYWlkVmFsaWQgPSBpbml0aWFsO1xuXG4gICAgICAgICAgICBpc05hbWVWYWxpZCA9IHR5cGVvZiBwZXJzb24ubmFtZSAhPT0gJ3VuZGVmaW5lZCcgPyBwZXJzb24ubmFtZS5sZW5ndGggPiAwIDogJ3ByaXN0aW5lJztcbiAgICAgICAgICAgIGlzUGFpZFZhbGlkID0gdHlwZW9mIHBlcnNvbi5wYWlkICE9PSAndW5kZWZpbmVkJyA/IHBlcnNvbi5wYWlkLm1hdGNoKC9eW1xcZCwuIF0rJC8pICE9PSBudWxsIDogJ3ByaXN0aW5lJztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBpc05hbWVWYWxpZCxcbiAgICAgICAgICAgICAgICBwYWlkOiBpc1BhaWRWYWxpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0ZVN0b3JlOyIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCIvKipcbiAqIEEgbW9kdWxlIG9mIG1ldGhvZHMgdGhhdCB5b3Ugd2FudCB0byBpbmNsdWRlIGluIGFsbCBhY3Rpb25zLlxuICogVGhpcyBtb2R1bGUgaXMgY29uc3VtZWQgYnkgYGNyZWF0ZUFjdGlvbmAuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHt9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLmNyZWF0ZWRTdG9yZXMgPSBbXTtcblxuZXhwb3J0cy5jcmVhdGVkQWN0aW9ucyA9IFtdO1xuXG5leHBvcnRzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHdoaWxlIChleHBvcnRzLmNyZWF0ZWRTdG9yZXMubGVuZ3RoKSB7XG4gICAgICAgIGV4cG9ydHMuY3JlYXRlZFN0b3Jlcy5wb3AoKTtcbiAgICB9XG4gICAgd2hpbGUgKGV4cG9ydHMuY3JlYXRlZEFjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGV4cG9ydHMuY3JlYXRlZEFjdGlvbnMucG9wKCk7XG4gICAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKSxcbiAgICBtYWtlciA9IHJlcXVpcmUoXCIuL2pvaW5zXCIpLmluc3RhbmNlSm9pbkNyZWF0b3I7XG5cbi8qKlxuICogRXh0cmFjdCBjaGlsZCBsaXN0ZW5hYmxlcyBmcm9tIGEgcGFyZW50IGZyb20gdGhlaXJcbiAqIGNoaWxkcmVuIHByb3BlcnR5IGFuZCByZXR1cm4gdGhlbSBpbiBhIGtleWVkIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5hYmxlIFRoZSBwYXJlbnQgbGlzdGVuYWJsZVxuICovXG52YXIgbWFwQ2hpbGRMaXN0ZW5hYmxlcyA9IGZ1bmN0aW9uIG1hcENoaWxkTGlzdGVuYWJsZXMobGlzdGVuYWJsZSkge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgY2hpbGRyZW4gPSB7fSxcbiAgICAgICAgY2hpbGROYW1lO1xuICAgIGZvciAoOyBpIDwgKGxpc3RlbmFibGUuY2hpbGRyZW4gfHwgW10pLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNoaWxkTmFtZSA9IGxpc3RlbmFibGUuY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChsaXN0ZW5hYmxlW2NoaWxkTmFtZV0pIHtcbiAgICAgICAgICAgIGNoaWxkcmVuW2NoaWxkTmFtZV0gPSBsaXN0ZW5hYmxlW2NoaWxkTmFtZV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xufTtcblxuLyoqXG4gKiBNYWtlIGEgZmxhdCBkaWN0aW9uYXJ5IG9mIGFsbCBsaXN0ZW5hYmxlcyBpbmNsdWRpbmcgdGhlaXJcbiAqIHBvc3NpYmxlIGNoaWxkcmVuIChyZWN1cnNpdmVseSksIGNvbmNhdGVuYXRpbmcgbmFtZXMgaW4gY2FtZWxDYXNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5hYmxlcyBUaGUgdG9wLWxldmVsIGxpc3RlbmFibGVzXG4gKi9cbnZhciBmbGF0dGVuTGlzdGVuYWJsZXMgPSBmdW5jdGlvbiBmbGF0dGVuTGlzdGVuYWJsZXMobGlzdGVuYWJsZXMpIHtcbiAgICB2YXIgZmxhdHRlbmVkID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIGxpc3RlbmFibGVzKSB7XG4gICAgICAgIHZhciBsaXN0ZW5hYmxlID0gbGlzdGVuYWJsZXNba2V5XTtcbiAgICAgICAgdmFyIGNoaWxkTWFwID0gbWFwQ2hpbGRMaXN0ZW5hYmxlcyhsaXN0ZW5hYmxlKTtcblxuICAgICAgICAvLyByZWN1cnNpdmVseSBmbGF0dGVuIGNoaWxkcmVuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGZsYXR0ZW5MaXN0ZW5hYmxlcyhjaGlsZE1hcCk7XG5cbiAgICAgICAgLy8gYWRkIHRoZSBwcmltYXJ5IGxpc3RlbmFibGUgYW5kIGNoaWxyZW5cbiAgICAgICAgZmxhdHRlbmVkW2tleV0gPSBsaXN0ZW5hYmxlO1xuICAgICAgICBmb3IgKHZhciBjaGlsZEtleSBpbiBjaGlsZHJlbikge1xuICAgICAgICAgICAgdmFyIGNoaWxkTGlzdGVuYWJsZSA9IGNoaWxkcmVuW2NoaWxkS2V5XTtcbiAgICAgICAgICAgIGZsYXR0ZW5lZFtrZXkgKyBfLmNhcGl0YWxpemUoY2hpbGRLZXkpXSA9IGNoaWxkTGlzdGVuYWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmbGF0dGVuZWQ7XG59O1xuXG4vKipcbiAqIEEgbW9kdWxlIG9mIG1ldGhvZHMgcmVsYXRlZCB0byBsaXN0ZW5pbmcuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQW4gaW50ZXJuYWwgdXRpbGl0eSBmdW5jdGlvbiB1c2VkIGJ5IGB2YWxpZGF0ZUxpc3RlbmluZ2BcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIFRoZSBsaXN0ZW5hYmxlIHdlIHdhbnQgdG8gc2VhcmNoIGZvclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBUaGUgcmVzdWx0IG9mIGEgcmVjdXJzaXZlIHNlYXJjaCBhbW9uZyBgdGhpcy5zdWJzY3JpcHRpb25zYFxuICAgICAqL1xuICAgIGhhc0xpc3RlbmVyOiBmdW5jdGlvbiBoYXNMaXN0ZW5lcihsaXN0ZW5hYmxlKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBsaXN0ZW5lcixcbiAgICAgICAgICAgIGxpc3RlbmFibGVzO1xuICAgICAgICBmb3IgKDsgaSA8ICh0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW10pLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsaXN0ZW5hYmxlcyA9IFtdLmNvbmNhdCh0aGlzLnN1YnNjcmlwdGlvbnNbaV0ubGlzdGVuYWJsZSk7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbGlzdGVuYWJsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmFibGVzW2pdO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lciA9PT0gbGlzdGVuYWJsZSB8fCBsaXN0ZW5lci5oYXNMaXN0ZW5lciAmJiBsaXN0ZW5lci5oYXNMaXN0ZW5lcihsaXN0ZW5hYmxlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGNvbnZlbmllbmNlIG1ldGhvZCB0aGF0IGxpc3RlbnMgdG8gYWxsIGxpc3RlbmFibGVzIGluIHRoZSBnaXZlbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuYWJsZXMgQW4gb2JqZWN0IG9mIGxpc3RlbmFibGVzLiBLZXlzIHdpbGwgYmUgdXNlZCBhcyBjYWxsYmFjayBtZXRob2QgbmFtZXMuXG4gICAgICovXG4gICAgbGlzdGVuVG9NYW55OiBmdW5jdGlvbiBsaXN0ZW5Ub01hbnkobGlzdGVuYWJsZXMpIHtcbiAgICAgICAgdmFyIGFsbExpc3RlbmFibGVzID0gZmxhdHRlbkxpc3RlbmFibGVzKGxpc3RlbmFibGVzKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGFsbExpc3RlbmFibGVzKSB7XG4gICAgICAgICAgICB2YXIgY2JuYW1lID0gXy5jYWxsYmFja05hbWUoa2V5KSxcbiAgICAgICAgICAgICAgICBsb2NhbG5hbWUgPSB0aGlzW2NibmFtZV0gPyBjYm5hbWUgOiB0aGlzW2tleV0gPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobG9jYWxuYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5UbyhhbGxMaXN0ZW5hYmxlc1trZXldLCBsb2NhbG5hbWUsIHRoaXNbY2JuYW1lICsgXCJEZWZhdWx0XCJdIHx8IHRoaXNbbG9jYWxuYW1lICsgXCJEZWZhdWx0XCJdIHx8IGxvY2FsbmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGNvbnRleHQgY2FuIGxpc3RlbiB0byB0aGUgc3VwcGxpZWQgbGlzdGVuYWJsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gICAgICogIGxpc3RlbmVkIHRvLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd8VW5kZWZpbmVkfSBBbiBlcnJvciBtZXNzYWdlLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgd2FzIG5vIHByb2JsZW0uXG4gICAgICovXG4gICAgdmFsaWRhdGVMaXN0ZW5pbmc6IGZ1bmN0aW9uIHZhbGlkYXRlTGlzdGVuaW5nKGxpc3RlbmFibGUpIHtcbiAgICAgICAgaWYgKGxpc3RlbmFibGUgPT09IHRoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkxpc3RlbmVyIGlzIG5vdCBhYmxlIHRvIGxpc3RlbiB0byBpdHNlbGZcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihsaXN0ZW5hYmxlLmxpc3RlbikpIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5hYmxlICsgXCIgaXMgbWlzc2luZyBhIGxpc3RlbiBtZXRob2RcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdGVuYWJsZS5oYXNMaXN0ZW5lciAmJiBsaXN0ZW5hYmxlLmhhc0xpc3RlbmVyKHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJMaXN0ZW5lciBjYW5ub3QgbGlzdGVuIHRvIHRoaXMgbGlzdGVuYWJsZSBiZWNhdXNlIG9mIGNpcmN1bGFyIGxvb3BcIjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIGEgc3Vic2NyaXB0aW9uIHRvIHRoZSBnaXZlbiBsaXN0ZW5hYmxlIGZvciB0aGUgY29udGV4dCBvYmplY3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIEFuIEFjdGlvbiBvciBTdG9yZSB0aGF0IHNob3VsZCBiZVxuICAgICAqICBsaXN0ZW5lZCB0by5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZGVmYXVsdENhbGxiYWNrIFRoZSBjYWxsYmFjayB0byByZWdpc3RlciBhcyBkZWZhdWx0IGhhbmRsZXJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHN1YnNjcmlwdGlvbiBvYmogd2hlcmUgYHN0b3BgIGlzIGFuIHVuc3ViIGZ1bmN0aW9uIGFuZCBgbGlzdGVuYWJsZWAgaXMgdGhlIG9iamVjdCBiZWluZyBsaXN0ZW5lZCB0b1xuICAgICAqL1xuICAgIGxpc3RlblRvOiBmdW5jdGlvbiBsaXN0ZW5UbyhsaXN0ZW5hYmxlLCBjYWxsYmFjaywgZGVmYXVsdENhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkZXN1YixcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlcixcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbm9iaixcbiAgICAgICAgICAgIHN1YnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW107XG4gICAgICAgIF8udGhyb3dJZih0aGlzLnZhbGlkYXRlTGlzdGVuaW5nKGxpc3RlbmFibGUpKTtcbiAgICAgICAgdGhpcy5mZXRjaEluaXRpYWxTdGF0ZShsaXN0ZW5hYmxlLCBkZWZhdWx0Q2FsbGJhY2spO1xuICAgICAgICBkZXN1YiA9IGxpc3RlbmFibGUubGlzdGVuKHRoaXNbY2FsbGJhY2tdIHx8IGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgICAgdW5zdWJzY3JpYmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gc3Vicy5pbmRleE9mKHN1YnNjcmlwdGlvbm9iaik7XG4gICAgICAgICAgICBfLnRocm93SWYoaW5kZXggPT09IC0xLCBcIlRyaWVkIHRvIHJlbW92ZSBsaXN0ZW4gYWxyZWFkeSBnb25lIGZyb20gc3Vic2NyaXB0aW9ucyBsaXN0IVwiKTtcbiAgICAgICAgICAgIHN1YnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGRlc3ViKCk7XG4gICAgICAgIH07XG4gICAgICAgIHN1YnNjcmlwdGlvbm9iaiA9IHtcbiAgICAgICAgICAgIHN0b3A6IHVuc3Vic2NyaWJlcixcbiAgICAgICAgICAgIGxpc3RlbmFibGU6IGxpc3RlbmFibGVcbiAgICAgICAgfTtcbiAgICAgICAgc3Vicy5wdXNoKHN1YnNjcmlwdGlvbm9iaik7XG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb25vYmo7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGxpc3RlbmluZyB0byBhIHNpbmdsZSBsaXN0ZW5hYmxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBUaGUgYWN0aW9uIG9yIHN0b3JlIHdlIG5vIGxvbmdlciB3YW50IHRvIGxpc3RlbiB0b1xuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIGEgc3Vic2NyaXB0aW9uIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZCwgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIHN0b3BMaXN0ZW5pbmdUbzogZnVuY3Rpb24gc3RvcExpc3RlbmluZ1RvKGxpc3RlbmFibGUpIHtcbiAgICAgICAgdmFyIHN1YixcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgZm9yICg7IGkgPCBzdWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdWIgPSBzdWJzW2ldO1xuICAgICAgICAgICAgaWYgKHN1Yi5saXN0ZW5hYmxlID09PSBsaXN0ZW5hYmxlKSB7XG4gICAgICAgICAgICAgICAgc3ViLnN0b3AoKTtcbiAgICAgICAgICAgICAgICBfLnRocm93SWYoc3Vicy5pbmRleE9mKHN1YikgIT09IC0xLCBcIkZhaWxlZCB0byByZW1vdmUgbGlzdGVuIGZyb20gc3Vic2NyaXB0aW9ucyBsaXN0IVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFsbCBzdWJzY3JpcHRpb25zIGFuZCBlbXB0aWVzIHN1YnNjcmlwdGlvbnMgYXJyYXlcbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nVG9BbGw6IGZ1bmN0aW9uIHN0b3BMaXN0ZW5pbmdUb0FsbCgpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyxcbiAgICAgICAgICAgIHN1YnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW107XG4gICAgICAgIHdoaWxlIChyZW1haW5pbmcgPSBzdWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3Vic1swXS5zdG9wKCk7XG4gICAgICAgICAgICBfLnRocm93SWYoc3Vicy5sZW5ndGggIT09IHJlbWFpbmluZyAtIDEsIFwiRmFpbGVkIHRvIHJlbW92ZSBsaXN0ZW4gZnJvbSBzdWJzY3JpcHRpb25zIGxpc3QhXCIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gYGxpc3RlblRvYC4gRmV0Y2hlcyBpbml0aWFsIGRhdGEgZnJvbSBhIHB1Ymxpc2hlciBpZiBpdCBoYXMgYSBgZ2V0SW5pdGlhbFN0YXRlYCBtZXRob2QuXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgVGhlIHB1Ymxpc2hlciB3ZSB3YW50IHRvIGdldCBpbml0aWFsIHN0YXRlIGZyb21cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZGVmYXVsdENhbGxiYWNrIFRoZSBtZXRob2QgdG8gcmVjZWl2ZSB0aGUgZGF0YVxuICAgICAqL1xuICAgIGZldGNoSW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBmZXRjaEluaXRpYWxTdGF0ZShsaXN0ZW5hYmxlLCBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgICAgICAgZGVmYXVsdENhbGxiYWNrID0gZGVmYXVsdENhbGxiYWNrICYmIHRoaXNbZGVmYXVsdENhbGxiYWNrXSB8fCBkZWZhdWx0Q2FsbGJhY2s7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZGVmYXVsdENhbGxiYWNrKSAmJiBfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUpKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGxpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKCk7XG4gICAgICAgICAgICBpZiAoZGF0YSAmJiBfLmlzRnVuY3Rpb24oZGF0YS50aGVuKSkge1xuICAgICAgICAgICAgICAgIGRhdGEudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRDYWxsYmFjay5hcHBseShtZSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdENhbGxiYWNrLmNhbGwodGhpcywgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uY2UgYWxsIGxpc3RlbmFibGVzIGhhdmUgdHJpZ2dlcmVkIGF0IGxlYXN0IG9uY2UuXG4gICAgICogSXQgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIGxhc3QgZW1pc3Npb24gZnJvbSBlYWNoIGxpc3RlbmFibGUuXG4gICAgICogQHBhcmFtIHsuLi5QdWJsaXNoZXJzfSBwdWJsaXNoZXJzIFB1Ymxpc2hlcnMgdGhhdCBzaG91bGQgYmUgdHJhY2tlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIG1ldGhvZCB0byBjYWxsIHdoZW4gYWxsIHB1Ymxpc2hlcnMgaGF2ZSBlbWl0dGVkXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBzdWJzY3JpcHRpb24gb2JqIHdoZXJlIGBzdG9wYCBpcyBhbiB1bnN1YiBmdW5jdGlvbiBhbmQgYGxpc3RlbmFibGVgIGlzIGFuIGFycmF5IG9mIGxpc3RlbmFibGVzXG4gICAgICovXG4gICAgam9pblRyYWlsaW5nOiBtYWtlcihcImxhc3RcIiksXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25jZSBhbGwgbGlzdGVuYWJsZXMgaGF2ZSB0cmlnZ2VyZWQgYXQgbGVhc3Qgb25jZS5cbiAgICAgKiBJdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgZmlyc3QgZW1pc3Npb24gZnJvbSBlYWNoIGxpc3RlbmFibGUuXG4gICAgICogQHBhcmFtIHsuLi5QdWJsaXNoZXJzfSBwdWJsaXNoZXJzIFB1Ymxpc2hlcnMgdGhhdCBzaG91bGQgYmUgdHJhY2tlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIG1ldGhvZCB0byBjYWxsIHdoZW4gYWxsIHB1Ymxpc2hlcnMgaGF2ZSBlbWl0dGVkXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBzdWJzY3JpcHRpb24gb2JqIHdoZXJlIGBzdG9wYCBpcyBhbiB1bnN1YiBmdW5jdGlvbiBhbmQgYGxpc3RlbmFibGVgIGlzIGFuIGFycmF5IG9mIGxpc3RlbmFibGVzXG4gICAgICovXG4gICAgam9pbkxlYWRpbmc6IG1ha2VyKFwiZmlyc3RcIiksXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25jZSBhbGwgbGlzdGVuYWJsZXMgaGF2ZSB0cmlnZ2VyZWQgYXQgbGVhc3Qgb25jZS5cbiAgICAgKiBJdCB3aWxsIGJlIGludm9rZWQgd2l0aCBhbGwgZW1pc3Npb24gZnJvbSBlYWNoIGxpc3RlbmFibGUuXG4gICAgICogQHBhcmFtIHsuLi5QdWJsaXNoZXJzfSBwdWJsaXNoZXJzIFB1Ymxpc2hlcnMgdGhhdCBzaG91bGQgYmUgdHJhY2tlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIG1ldGhvZCB0byBjYWxsIHdoZW4gYWxsIHB1Ymxpc2hlcnMgaGF2ZSBlbWl0dGVkXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBzdWJzY3JpcHRpb24gb2JqIHdoZXJlIGBzdG9wYCBpcyBhbiB1bnN1YiBmdW5jdGlvbiBhbmQgYGxpc3RlbmFibGVgIGlzIGFuIGFycmF5IG9mIGxpc3RlbmFibGVzXG4gICAgICovXG4gICAgam9pbkNvbmNhdDogbWFrZXIoXCJhbGxcIiksXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25jZSBhbGwgbGlzdGVuYWJsZXMgaGF2ZSB0cmlnZ2VyZWQuXG4gICAgICogSWYgYSBjYWxsYmFjayB0cmlnZ2VycyB0d2ljZSBiZWZvcmUgdGhhdCBoYXBwZW5zLCBhbiBlcnJvciBpcyB0aHJvd24uXG4gICAgICogQHBhcmFtIHsuLi5QdWJsaXNoZXJzfSBwdWJsaXNoZXJzIFB1Ymxpc2hlcnMgdGhhdCBzaG91bGQgYmUgdHJhY2tlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIG1ldGhvZCB0byBjYWxsIHdoZW4gYWxsIHB1Ymxpc2hlcnMgaGF2ZSBlbWl0dGVkXG4gICAgICogQHJldHVybnMge09iamVjdH0gQSBzdWJzY3JpcHRpb24gb2JqIHdoZXJlIGBzdG9wYCBpcyBhbiB1bnN1YiBmdW5jdGlvbiBhbmQgYGxpc3RlbmFibGVgIGlzIGFuIGFycmF5IG9mIGxpc3RlbmFibGVzXG4gICAgICovXG4gICAgam9pblN0cmljdDogbWFrZXIoXCJzdHJpY3RcIilcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5cbi8qKlxuICogQSBtb2R1bGUgb2YgbWV0aG9kcyBmb3Igb2JqZWN0IHRoYXQgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBsaXN0ZW4gdG8uXG4gKiBUaGlzIG1vZHVsZSBpcyBjb25zdW1lZCBieSBgY3JlYXRlU3RvcmVgIGFuZCBgY3JlYXRlQWN0aW9uYFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEhvb2sgdXNlZCBieSB0aGUgcHVibGlzaGVyIHRoYXQgaXMgaW52b2tlZCBiZWZvcmUgZW1pdHRpbmdcbiAgICAgKiBhbmQgYmVmb3JlIGBzaG91bGRFbWl0YC4gVGhlIGFyZ3VtZW50cyBhcmUgdGhlIG9uZXMgdGhhdCB0aGUgYWN0aW9uXG4gICAgICogaXMgaW52b2tlZCB3aXRoLiBJZiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgc29tZXRoaW5nIG90aGVyIHRoYW5cbiAgICAgKiB1bmRlZmluZWQsIHRoYXQgd2lsbCBiZSBwYXNzZWQgb24gYXMgYXJndW1lbnRzIGZvciBzaG91bGRFbWl0IGFuZFxuICAgICAqIGVtaXNzaW9uLlxuICAgICAqL1xuICAgIHByZUVtaXQ6IGZ1bmN0aW9uIHByZUVtaXQoKSB7fSxcblxuICAgIC8qKlxuICAgICAqIEhvb2sgdXNlZCBieSB0aGUgcHVibGlzaGVyIGFmdGVyIGBwcmVFbWl0YCB0byBkZXRlcm1pbmUgaWYgdGhlXG4gICAgICogZXZlbnQgc2hvdWxkIGJlIGVtaXR0ZWQgd2l0aCBnaXZlbiBhcmd1bWVudHMuIFRoaXMgbWF5IGJlIG92ZXJyaWRkZW5cbiAgICAgKiBpbiB5b3VyIGFwcGxpY2F0aW9uLCBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiBldmVudCBzaG91bGQgYmUgZW1pdHRlZFxuICAgICAqL1xuICAgIHNob3VsZEVtaXQ6IGZ1bmN0aW9uIHNob3VsZEVtaXQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYWN0aW9uIHRyaWdnZXJlZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge01peGVkfSBbb3B0aW9uYWxdIGJpbmRDb250ZXh0IFRoZSBjb250ZXh0IHRvIGJpbmQgdGhlIGNhbGxiYWNrIHdpdGhcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IENhbGxiYWNrIHRoYXQgdW5zdWJzY3JpYmVzIHRoZSByZWdpc3RlcmVkIGV2ZW50IGhhbmRsZXJcbiAgICAgKi9cbiAgICBsaXN0ZW46IGZ1bmN0aW9uIGxpc3RlbihjYWxsYmFjaywgYmluZENvbnRleHQpIHtcbiAgICAgICAgYmluZENvbnRleHQgPSBiaW5kQ29udGV4dCB8fCB0aGlzO1xuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gZXZlbnRIYW5kbGVyKGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoYmluZENvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAgICAgbWUgPSB0aGlzLFxuICAgICAgICAgICAgYWJvcnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVtaXR0ZXIuYWRkTGlzdGVuZXIodGhpcy5ldmVudExhYmVsLCBldmVudEhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBtZS5lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG1lLmV2ZW50TGFiZWwsIGV2ZW50SGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBoYW5kbGVycyB0byBwcm9taXNlIHRoYXQgdHJpZ2dlciB0aGUgY29tcGxldGVkIGFuZCBmYWlsZWRcbiAgICAgKiBjaGlsZCBwdWJsaXNoZXJzLCBpZiBhdmFpbGFibGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gVGhlIHByb21pc2UgdG8gYXR0YWNoIHRvXG4gICAgICovXG4gICAgcHJvbWlzZTogZnVuY3Rpb24gcHJvbWlzZShfcHJvbWlzZSkge1xuICAgICAgICB2YXIgbWUgPSB0aGlzO1xuXG4gICAgICAgIHZhciBjYW5IYW5kbGVQcm9taXNlID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKFwiY29tcGxldGVkXCIpID49IDAgJiYgdGhpcy5jaGlsZHJlbi5pbmRleE9mKFwiZmFpbGVkXCIpID49IDA7XG5cbiAgICAgICAgaWYgKCFjYW5IYW5kbGVQcm9taXNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQdWJsaXNoZXIgbXVzdCBoYXZlIFxcXCJjb21wbGV0ZWRcXFwiIGFuZCBcXFwiZmFpbGVkXFxcIiBjaGlsZCBwdWJsaXNoZXJzXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgX3Byb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBtZS5jb21wbGV0ZWQocmVzcG9uc2UpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtZS5mYWlsZWQoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlcyB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGFjdGlvbiB0cmlnZ2VyZWQsIHdoaWNoIHNob3VsZFxuICAgICAqIHJldHVybiBhIHByb21pc2UgdGhhdCBpbiB0dXJuIGlzIHBhc3NlZCB0byBgdGhpcy5wcm9taXNlYFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAgICAgKi9cbiAgICBsaXN0ZW5BbmRQcm9taXNlOiBmdW5jdGlvbiBsaXN0ZW5BbmRQcm9taXNlKGNhbGxiYWNrLCBiaW5kQ29udGV4dCkge1xuICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICBiaW5kQ29udGV4dCA9IGJpbmRDb250ZXh0IHx8IHRoaXM7XG4gICAgICAgIHRoaXMud2lsbENhbGxQcm9taXNlID0gKHRoaXMud2lsbENhbGxQcm9taXNlIHx8IDApICsgMTtcblxuICAgICAgICB2YXIgcmVtb3ZlTGlzdGVuID0gdGhpcy5saXN0ZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgYSBmdW5jdGlvbiByZXR1cm5pbmcgYSBwcm9taXNlIGJ1dCBnb3QgXCIgKyBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgIHByb21pc2UgPSBjYWxsYmFjay5hcHBseShiaW5kQ29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gbWUucHJvbWlzZS5jYWxsKG1lLCBwcm9taXNlKTtcbiAgICAgICAgfSwgYmluZENvbnRleHQpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtZS53aWxsQ2FsbFByb21pc2UtLTtcbiAgICAgICAgICAgIHJlbW92ZUxpc3Rlbi5jYWxsKG1lKTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIGFuIGV2ZW50IHVzaW5nIGB0aGlzLmVtaXR0ZXJgIChpZiBgc2hvdWxkRW1pdGAgYWdyZWVzKVxuICAgICAqL1xuICAgIHRyaWdnZXI6IGZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgcHJlID0gdGhpcy5wcmVFbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBhcmdzID0gcHJlID09PSB1bmRlZmluZWQgPyBhcmdzIDogXy5pc0FyZ3VtZW50cyhwcmUpID8gcHJlIDogW10uY29uY2F0KHByZSk7XG4gICAgICAgIGlmICh0aGlzLnNob3VsZEVtaXQuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KHRoaXMuZXZlbnRMYWJlbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gcHVibGlzaCB0aGUgZXZlbnQgb24gdGhlIG5leHQgdGlja1xuICAgICAqL1xuICAgIHRyaWdnZXJBc3luYzogZnVuY3Rpb24gdHJpZ2dlckFzeW5jKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIG1lID0gdGhpcztcbiAgICAgICAgXy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtZS50cmlnZ2VyLmFwcGx5KG1lLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBQcm9taXNlIGZvciB0aGUgdHJpZ2dlcmVkIGFjdGlvblxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKiAgIFJlc29sdmVkIGJ5IGNvbXBsZXRlZCBjaGlsZCBhY3Rpb24uXG4gICAgICogICBSZWplY3RlZCBieSBmYWlsZWQgY2hpbGQgYWN0aW9uLlxuICAgICAqICAgSWYgbGlzdGVuQW5kUHJvbWlzZSdkLCB0aGVuIHByb21pc2UgYXNzb2NpYXRlZCB0byB0aGlzIHRyaWdnZXIuXG4gICAgICogICBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIGZvciBuZXh0IGNoaWxkIGFjdGlvbiBjb21wbGV0aW9uLlxuICAgICAqL1xuICAgIHRyaWdnZXJQcm9taXNlOiBmdW5jdGlvbiB0cmlnZ2VyUHJvbWlzZSgpIHtcbiAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgdmFyIGNhbkhhbmRsZVByb21pc2UgPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoXCJjb21wbGV0ZWRcIikgPj0gMCAmJiB0aGlzLmNoaWxkcmVuLmluZGV4T2YoXCJmYWlsZWRcIikgPj0gMDtcblxuICAgICAgICB2YXIgcHJvbWlzZSA9IF8uY3JlYXRlUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAvLyBJZiBgbGlzdGVuQW5kUHJvbWlzZWAgaXMgbGlzdGVuaW5nXG4gICAgICAgICAgICAvLyBwYXRjaCBgcHJvbWlzZWAgdy8gY29udGV4dC1sb2FkZWQgcmVzb2x2ZS9yZWplY3RcbiAgICAgICAgICAgIGlmIChtZS53aWxsQ2FsbFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzUHJvbWlzZSA9IG1lLnByb21pc2U7XG4gICAgICAgICAgICAgICAgICAgIG1lLnByb21pc2UgPSBmdW5jdGlvbiAoaW5wdXRQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFjayB0byB5b3VyIHJlZ3VsYXJseSBzY2hlZHVsZSBwcm9ncmFtbWluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lLnByb21pc2UgPSBwcmV2aW91c1Byb21pc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWUucHJvbWlzZS5hcHBseShtZSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgbWUudHJpZ2dlci5hcHBseShtZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2FuSGFuZGxlUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdmVTdWNjZXNzID0gbWUuY29tcGxldGVkLmxpc3RlbihmdW5jdGlvbiAoYXJnc0Fycikge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVTdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUZhaWxlZCgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGFyZ3NBcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUZhaWxlZCA9IG1lLmZhaWxlZC5saXN0ZW4oZnVuY3Rpb24gKGFyZ3NBcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlU3VjY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVGYWlsZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGFyZ3NBcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZS50cmlnZ2VyQXN5bmMuYXBwbHkobWUsIGFyZ3MpO1xuXG4gICAgICAgICAgICBpZiAoIWNhbkhhbmRsZVByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbn07IiwiLyoqXG4gKiBBIG1vZHVsZSBvZiBtZXRob2RzIHRoYXQgeW91IHdhbnQgdG8gaW5jbHVkZSBpbiBhbGwgc3RvcmVzLlxuICogVGhpcyBtb2R1bGUgaXMgY29uc3VtZWQgYnkgYGNyZWF0ZVN0b3JlYC5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0b3JlLCBkZWZpbml0aW9uKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBkZWZpbml0aW9uKSB7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmaW5pdGlvbiwgbmFtZSk7XG5cbiAgICAgICAgICAgIGlmICghcHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlIHx8IHR5cGVvZiBwcm9wZXJ0eURlc2NyaXB0b3IudmFsdWUgIT09IFwiZnVuY3Rpb25cIiB8fCAhZGVmaW5pdGlvbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdG9yZVtuYW1lXSA9IGRlZmluaXRpb25bbmFtZV0uYmluZChzdG9yZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBkZWZpbml0aW9uW25hbWVdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ICE9PSBcImZ1bmN0aW9uXCIgfHwgIWRlZmluaXRpb24uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RvcmVbbmFtZV0gPSBwcm9wZXJ0eS5iaW5kKHN0b3JlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdG9yZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vdXRpbHNcIiksXG4gICAgQWN0aW9uTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0FjdGlvbk1ldGhvZHNcIiksXG4gICAgUHVibGlzaGVyTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1B1Ymxpc2hlck1ldGhvZHNcIiksXG4gICAgS2VlcCA9IHJlcXVpcmUoXCIuL0tlZXBcIik7XG5cbnZhciBhbGxvd2VkID0geyBwcmVFbWl0OiAxLCBzaG91bGRFbWl0OiAxIH07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhY3Rpb24gZnVuY3RvciBvYmplY3QuIEl0IGlzIG1peGVkIGluIHdpdGggZnVuY3Rpb25zXG4gKiBmcm9tIHRoZSBgUHVibGlzaGVyTWV0aG9kc2AgbWl4aW4uIGBwcmVFbWl0YCBhbmQgYHNob3VsZEVtaXRgIG1heVxuICogYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGFjdGlvbiBvYmplY3QgZGVmaW5pdGlvblxuICovXG52YXIgY3JlYXRlQWN0aW9uID0gZnVuY3Rpb24gY3JlYXRlQWN0aW9uKGRlZmluaXRpb24pIHtcblxuICAgIGRlZmluaXRpb24gPSBkZWZpbml0aW9uIHx8IHt9O1xuICAgIGlmICghXy5pc09iamVjdChkZWZpbml0aW9uKSkge1xuICAgICAgICBkZWZpbml0aW9uID0geyBhY3Rpb25OYW1lOiBkZWZpbml0aW9uIH07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYSBpbiBBY3Rpb25NZXRob2RzKSB7XG4gICAgICAgIGlmICghYWxsb3dlZFthXSAmJiBQdWJsaXNoZXJNZXRob2RzW2FdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcnJpZGUgQVBJIG1ldGhvZCBcIiArIGEgKyBcIiBpbiBSZWZsdXguQWN0aW9uTWV0aG9kcy4gVXNlIGFub3RoZXIgbWV0aG9kIG5hbWUgb3Igb3ZlcnJpZGUgaXQgb24gUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBkIGluIGRlZmluaXRpb24pIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2RdICYmIFB1Ymxpc2hlck1ldGhvZHNbZF0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgZCArIFwiIGluIGFjdGlvbiBjcmVhdGlvbi4gVXNlIGFub3RoZXIgbWV0aG9kIG5hbWUgb3Igb3ZlcnJpZGUgaXQgb24gUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWZpbml0aW9uLmNoaWxkcmVuID0gZGVmaW5pdGlvbi5jaGlsZHJlbiB8fCBbXTtcbiAgICBpZiAoZGVmaW5pdGlvbi5hc3luY1Jlc3VsdCkge1xuICAgICAgICBkZWZpbml0aW9uLmNoaWxkcmVuID0gZGVmaW5pdGlvbi5jaGlsZHJlbi5jb25jYXQoW1wiY29tcGxldGVkXCIsIFwiZmFpbGVkXCJdKTtcbiAgICB9XG5cbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGNoaWxkQWN0aW9ucyA9IHt9O1xuICAgIGZvciAoOyBpIDwgZGVmaW5pdGlvbi5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmFtZSA9IGRlZmluaXRpb24uY2hpbGRyZW5baV07XG4gICAgICAgIGNoaWxkQWN0aW9uc1tuYW1lXSA9IGNyZWF0ZUFjdGlvbihuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IF8uZXh0ZW5kKHtcbiAgICAgICAgZXZlbnRMYWJlbDogXCJhY3Rpb25cIixcbiAgICAgICAgZW1pdHRlcjogbmV3IF8uRXZlbnRFbWl0dGVyKCksXG4gICAgICAgIF9pc0FjdGlvbjogdHJ1ZVxuICAgIH0sIFB1Ymxpc2hlck1ldGhvZHMsIEFjdGlvbk1ldGhvZHMsIGRlZmluaXRpb24pO1xuXG4gICAgdmFyIGZ1bmN0b3IgPSBmdW5jdGlvbiBmdW5jdG9yKCkge1xuICAgICAgICB2YXIgdHJpZ2dlclR5cGUgPSBmdW5jdG9yLnN5bmMgPyBcInRyaWdnZXJcIiA6IF8uZW52aXJvbm1lbnQuaGFzUHJvbWlzZSA/IFwidHJpZ2dlclByb21pc2VcIiA6IFwidHJpZ2dlckFzeW5jXCI7XG4gICAgICAgIHJldHVybiBmdW5jdG9yW3RyaWdnZXJUeXBlXS5hcHBseShmdW5jdG9yLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBfLmV4dGVuZChmdW5jdG9yLCBjaGlsZEFjdGlvbnMsIGNvbnRleHQpO1xuXG4gICAgS2VlcC5jcmVhdGVkQWN0aW9ucy5wdXNoKGZ1bmN0b3IpO1xuXG4gICAgcmV0dXJuIGZ1bmN0b3I7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUFjdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKSxcbiAgICBLZWVwID0gcmVxdWlyZShcIi4vS2VlcFwiKSxcbiAgICBtaXhlciA9IHJlcXVpcmUoXCIuL21peGVyXCIpLFxuICAgIGJpbmRNZXRob2RzID0gcmVxdWlyZShcIi4vYmluZE1ldGhvZHNcIik7XG5cbnZhciBhbGxvd2VkID0geyBwcmVFbWl0OiAxLCBzaG91bGRFbWl0OiAxIH07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBldmVudCBlbWl0dGluZyBEYXRhIFN0b3JlLiBJdCBpcyBtaXhlZCBpbiB3aXRoIGZ1bmN0aW9uc1xuICogZnJvbSB0aGUgYExpc3RlbmVyTWV0aG9kc2AgYW5kIGBQdWJsaXNoZXJNZXRob2RzYCBtaXhpbnMuIGBwcmVFbWl0YFxuICogYW5kIGBzaG91bGRFbWl0YCBtYXkgYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGRhdGEgc3RvcmUgb2JqZWN0IGRlZmluaXRpb25cbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBkYXRhIHN0b3JlIGluc3RhbmNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcblxuICAgIHZhciBTdG9yZU1ldGhvZHMgPSByZXF1aXJlKFwiLi9TdG9yZU1ldGhvZHNcIiksXG4gICAgICAgIFB1Ymxpc2hlck1ldGhvZHMgPSByZXF1aXJlKFwiLi9QdWJsaXNoZXJNZXRob2RzXCIpLFxuICAgICAgICBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKFwiLi9MaXN0ZW5lck1ldGhvZHNcIik7XG5cbiAgICBkZWZpbml0aW9uID0gZGVmaW5pdGlvbiB8fCB7fTtcblxuICAgIGZvciAodmFyIGEgaW4gU3RvcmVNZXRob2RzKSB7XG4gICAgICAgIGlmICghYWxsb3dlZFthXSAmJiAoUHVibGlzaGVyTWV0aG9kc1thXSB8fCBMaXN0ZW5lck1ldGhvZHNbYV0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcnJpZGUgQVBJIG1ldGhvZCBcIiArIGEgKyBcIiBpbiBSZWZsdXguU3RvcmVNZXRob2RzLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyAvIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBkIGluIGRlZmluaXRpb24pIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2RdICYmIChQdWJsaXNoZXJNZXRob2RzW2RdIHx8IExpc3RlbmVyTWV0aG9kc1tkXSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgZCArIFwiIGluIHN0b3JlIGNyZWF0aW9uLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyAvIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgaW5zdGVhZC5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWZpbml0aW9uID0gbWl4ZXIoZGVmaW5pdGlvbik7XG5cbiAgICBmdW5jdGlvbiBTdG9yZSgpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgYXJyO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IF8uRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMuZXZlbnRMYWJlbCA9IFwiY2hhbmdlXCI7XG4gICAgICAgIGJpbmRNZXRob2RzKHRoaXMsIGRlZmluaXRpb24pO1xuICAgICAgICBpZiAodGhpcy5pbml0ICYmIF8uaXNGdW5jdGlvbih0aGlzLmluaXQpKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5saXN0ZW5hYmxlcykge1xuICAgICAgICAgICAgYXJyID0gW10uY29uY2F0KHRoaXMubGlzdGVuYWJsZXMpO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RlblRvTWFueShhcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXy5leHRlbmQoU3RvcmUucHJvdG90eXBlLCBMaXN0ZW5lck1ldGhvZHMsIFB1Ymxpc2hlck1ldGhvZHMsIFN0b3JlTWV0aG9kcywgZGVmaW5pdGlvbik7XG5cbiAgICB2YXIgc3RvcmUgPSBuZXcgU3RvcmUoKTtcbiAgICBLZWVwLmNyZWF0ZWRTdG9yZXMucHVzaChzdG9yZSk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgUmVmbHV4ID0ge1xuICAgIHZlcnNpb246IHtcbiAgICAgICAgXCJyZWZsdXgtY29yZVwiOiBcIjAuMi4xXCJcbiAgICB9XG59O1xuXG5SZWZsdXguQWN0aW9uTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0FjdGlvbk1ldGhvZHNcIik7XG5cblJlZmx1eC5MaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKFwiLi9MaXN0ZW5lck1ldGhvZHNcIik7XG5cblJlZmx1eC5QdWJsaXNoZXJNZXRob2RzID0gcmVxdWlyZShcIi4vUHVibGlzaGVyTWV0aG9kc1wiKTtcblxuUmVmbHV4LlN0b3JlTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1N0b3JlTWV0aG9kc1wiKTtcblxuUmVmbHV4LmNyZWF0ZUFjdGlvbiA9IHJlcXVpcmUoXCIuL2NyZWF0ZUFjdGlvblwiKTtcblxuUmVmbHV4LmNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIi4vY3JlYXRlU3RvcmVcIik7XG5cbnZhciBtYWtlciA9IHJlcXVpcmUoXCIuL2pvaW5zXCIpLnN0YXRpY0pvaW5DcmVhdG9yO1xuXG5SZWZsdXguam9pblRyYWlsaW5nID0gUmVmbHV4LmFsbCA9IG1ha2VyKFwibGFzdFwiKTsgLy8gUmVmbHV4LmFsbCBhbGlhcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXG5SZWZsdXguam9pbkxlYWRpbmcgPSBtYWtlcihcImZpcnN0XCIpO1xuXG5SZWZsdXguam9pblN0cmljdCA9IG1ha2VyKFwic3RyaWN0XCIpO1xuXG5SZWZsdXguam9pbkNvbmNhdCA9IG1ha2VyKFwiYWxsXCIpO1xuXG52YXIgXyA9IFJlZmx1eC51dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuXG5SZWZsdXguRXZlbnRFbWl0dGVyID0gXy5FdmVudEVtaXR0ZXI7XG5cblJlZmx1eC5Qcm9taXNlID0gXy5Qcm9taXNlO1xuXG4vKipcbiAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIHNldCBvZiBhY3Rpb25zXG4gKlxuICogQHBhcmFtIGRlZmluaXRpb25zIHRoZSBkZWZpbml0aW9ucyBmb3IgdGhlIGFjdGlvbnMgdG8gYmUgY3JlYXRlZFxuICogQHJldHVybnMgYW4gb2JqZWN0IHdpdGggYWN0aW9ucyBvZiBjb3JyZXNwb25kaW5nIGFjdGlvbiBuYW1lc1xuICovXG5SZWZsdXguY3JlYXRlQWN0aW9ucyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbiByZWR1Y2VyKGRlZmluaXRpb25zLCBhY3Rpb25zKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gZGVmaW5pdGlvbnNbYWN0aW9uTmFtZV07XG4gICAgICAgICAgICBhY3Rpb25zW2FjdGlvbk5hbWVdID0gUmVmbHV4LmNyZWF0ZUFjdGlvbih2YWwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkZWZpbml0aW9ucykge1xuICAgICAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgICAgICBpZiAoZGVmaW5pdGlvbnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZGVmaW5pdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNPYmplY3QodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICByZWR1Y2VyKHZhbCwgYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uc1t2YWxdID0gUmVmbHV4LmNyZWF0ZUFjdGlvbih2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVkdWNlcihkZWZpbml0aW9ucywgYWN0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogU2V0cyB0aGUgZXZlbnRtaXR0ZXIgdGhhdCBSZWZsdXggdXNlc1xuICovXG5SZWZsdXguc2V0RXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKGN0eCkge1xuICAgIFJlZmx1eC5FdmVudEVtaXR0ZXIgPSBfLkV2ZW50RW1pdHRlciA9IGN0eDtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgUHJvbWlzZSBsaWJyYXJ5IHRoYXQgUmVmbHV4IHVzZXNcbiAqL1xuUmVmbHV4LnNldFByb21pc2UgPSBmdW5jdGlvbiAoY3R4KSB7XG4gICAgUmVmbHV4LlByb21pc2UgPSBfLlByb21pc2UgPSBjdHg7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIFByb21pc2UgZmFjdG9yeSB0aGF0IGNyZWF0ZXMgbmV3IHByb21pc2VzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmYWN0b3J5IGhhcyB0aGUgc2lnbmF0dXJlIGBmdW5jdGlvbihyZXNvbHZlcikgeyByZXR1cm4gW25ldyBQcm9taXNlXTsgfWBcbiAqL1xuUmVmbHV4LnNldFByb21pc2VGYWN0b3J5ID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBfLmNyZWF0ZVByb21pc2UgPSBmYWN0b3J5O1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBtZXRob2QgdXNlZCBmb3IgZGVmZXJyaW5nIGFjdGlvbnMgYW5kIHN0b3Jlc1xuICovXG5SZWZsdXgubmV4dFRpY2sgPSBmdW5jdGlvbiAobmV4dFRpY2spIHtcbiAgICBfLm5leHRUaWNrID0gbmV4dFRpY2s7XG59O1xuXG5SZWZsdXgudXNlID0gZnVuY3Rpb24gKHBsdWdpbkNiKSB7XG4gICAgcGx1Z2luQ2IoUmVmbHV4KTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIHNldCBvZiBjcmVhdGVkIGFjdGlvbnMgYW5kIHN0b3JlcyBmb3IgaW50cm9zcGVjdGlvblxuICovXG4vKmVzbGludC1kaXNhYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlKi9cblJlZmx1eC5fX2tlZXAgPSByZXF1aXJlKFwiLi9LZWVwXCIpO1xuLyplc2xpbnQtZW5hYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlKi9cblxuLyoqXG4gKiBXYXJuIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIG5vdCBhdmFpbGFibGVcbiAqL1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBub3QgYXZhaWxhYmxlLiBcIiArIFwiRVM1IHNoaW0gcmVxdWlyZWQuIFwiICsgXCJodHRwczovL2dpdGh1Yi5jb20vc3BvaWtlL3JlZmx1eGpzI2VzNVwiKTtcbn1cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBSZWZsdXg7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIi8qKlxuICogSW50ZXJuYWwgbW9kdWxlIHVzZWQgdG8gY3JlYXRlIHN0YXRpYyBhbmQgaW5zdGFuY2Ugam9pbiBtZXRob2RzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGVTdG9yZSA9IHJlcXVpcmUoXCIuL2NyZWF0ZVN0b3JlXCIpLFxuICAgIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcblxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuICAgIHN0cmF0ZWd5TWV0aG9kTmFtZXMgPSB7XG4gICAgc3RyaWN0OiBcImpvaW5TdHJpY3RcIixcbiAgICBmaXJzdDogXCJqb2luTGVhZGluZ1wiLFxuICAgIGxhc3Q6IFwiam9pblRyYWlsaW5nXCIsXG4gICAgYWxsOiBcImpvaW5Db25jYXRcIlxufTtcblxuLyoqXG4gKiBVc2VkIGluIGBpbmRleC5qc2AgdG8gY3JlYXRlIHRoZSBzdGF0aWMgam9pbiBtZXRob2RzXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyYXRlZ3kgV2hpY2ggc3RyYXRlZ3kgdG8gdXNlIHdoZW4gdHJhY2tpbmcgbGlzdGVuYWJsZSB0cmlnZ2VyIGFyZ3VtZW50c1xuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0YXRpYyBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgc3RvcmUgd2l0aCBhIGpvaW4gbGlzdGVuIG9uIHRoZSBnaXZlbiBsaXN0ZW5hYmxlcyB1c2luZyB0aGUgZ2l2ZW4gc3RyYXRlZ3lcbiAqL1xuZXhwb3J0cy5zdGF0aWNKb2luQ3JlYXRvciA9IGZ1bmN0aW9uIChzdHJhdGVneSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSAvKiBsaXN0ZW5hYmxlcy4uLiAqL3tcbiAgICAgICAgdmFyIGxpc3RlbmFibGVzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RvcmUoe1xuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzW3N0cmF0ZWd5TWV0aG9kTmFtZXNbc3RyYXRlZ3ldXS5hcHBseSh0aGlzLCBsaXN0ZW5hYmxlcy5jb25jYXQoXCJ0cmlnZ2VyQXN5bmNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBVc2VkIGluIGBMaXN0ZW5lck1ldGhvZHMuanNgIHRvIGNyZWF0ZSB0aGUgaW5zdGFuY2Ugam9pbiBtZXRob2RzXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyYXRlZ3kgV2hpY2ggc3RyYXRlZ3kgdG8gdXNlIHdoZW4gdHJhY2tpbmcgbGlzdGVuYWJsZSB0cmlnZ2VyIGFyZ3VtZW50c1xuICogQHJldHVybnMge0Z1bmN0aW9ufSBBbiBpbnN0YW5jZSBtZXRob2Qgd2hpY2ggc2V0cyB1cCBhIGpvaW4gbGlzdGVuIG9uIHRoZSBnaXZlbiBsaXN0ZW5hYmxlcyB1c2luZyB0aGUgZ2l2ZW4gc3RyYXRlZ3lcbiAqL1xuZXhwb3J0cy5pbnN0YW5jZUpvaW5DcmVhdG9yID0gZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIC8qIGxpc3RlbmFibGVzLi4uLCBjYWxsYmFjayove1xuICAgICAgICBfLnRocm93SWYoYXJndW1lbnRzLmxlbmd0aCA8IDIsIFwiQ2Fubm90IGNyZWF0ZSBhIGpvaW4gd2l0aCBsZXNzIHRoYW4gMiBsaXN0ZW5hYmxlcyFcIik7XG4gICAgICAgIHZhciBsaXN0ZW5hYmxlcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbGlzdGVuYWJsZXMucG9wKCksXG4gICAgICAgICAgICBudW1iZXJPZkxpc3RlbmFibGVzID0gbGlzdGVuYWJsZXMubGVuZ3RoLFxuICAgICAgICAgICAgam9pbiA9IHtcbiAgICAgICAgICAgIG51bWJlck9mTGlzdGVuYWJsZXM6IG51bWJlck9mTGlzdGVuYWJsZXMsXG4gICAgICAgICAgICBjYWxsYmFjazogdGhpc1tjYWxsYmFja10gfHwgY2FsbGJhY2ssXG4gICAgICAgICAgICBsaXN0ZW5lcjogdGhpcyxcbiAgICAgICAgICAgIHN0cmF0ZWd5OiBzdHJhdGVneVxuICAgICAgICB9LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGNhbmNlbHMgPSBbXSxcbiAgICAgICAgICAgIHN1Ym9iajtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mTGlzdGVuYWJsZXM7IGkrKykge1xuICAgICAgICAgICAgXy50aHJvd0lmKHRoaXMudmFsaWRhdGVMaXN0ZW5pbmcobGlzdGVuYWJsZXNbaV0pKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZMaXN0ZW5hYmxlczsgaSsrKSB7XG4gICAgICAgICAgICBjYW5jZWxzLnB1c2gobGlzdGVuYWJsZXNbaV0ubGlzdGVuKG5ld0xpc3RlbmVyKGksIGpvaW4pLCB0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzZXQoam9pbik7XG4gICAgICAgIHN1Ym9iaiA9IHsgbGlzdGVuYWJsZTogbGlzdGVuYWJsZXMgfTtcbiAgICAgICAgc3Vib2JqLnN0b3AgPSBtYWtlU3RvcHBlcihzdWJvYmosIGNhbmNlbHMsIHRoaXMpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSAodGhpcy5zdWJzY3JpcHRpb25zIHx8IFtdKS5jb25jYXQoc3Vib2JqKTtcbiAgICAgICAgcmV0dXJuIHN1Ym9iajtcbiAgICB9O1xufTtcblxuLy8gLS0tLSBpbnRlcm5hbCBqb2luIGZ1bmN0aW9ucyAtLS0tXG5cbmZ1bmN0aW9uIG1ha2VTdG9wcGVyKHN1Ym9iaiwgY2FuY2VscywgY29udGV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgc3VicyA9IGNvbnRleHQuc3Vic2NyaXB0aW9ucyxcbiAgICAgICAgICAgIGluZGV4ID0gc3VicyA/IHN1YnMuaW5kZXhPZihzdWJvYmopIDogLTE7XG4gICAgICAgIF8udGhyb3dJZihpbmRleCA9PT0gLTEsIFwiVHJpZWQgdG8gcmVtb3ZlIGpvaW4gYWxyZWFkeSBnb25lIGZyb20gc3Vic2NyaXB0aW9ucyBsaXN0IVwiKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNhbmNlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbmNlbHNbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBzdWJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoam9pbikge1xuICAgIGpvaW4ubGlzdGVuYWJsZXNFbWl0dGVkID0gbmV3IEFycmF5KGpvaW4ubnVtYmVyT2ZMaXN0ZW5hYmxlcyk7XG4gICAgam9pbi5hcmdzID0gbmV3IEFycmF5KGpvaW4ubnVtYmVyT2ZMaXN0ZW5hYmxlcyk7XG59XG5cbmZ1bmN0aW9uIG5ld0xpc3RlbmVyKGksIGpvaW4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2FsbGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChqb2luLmxpc3RlbmFibGVzRW1pdHRlZFtpXSkge1xuICAgICAgICAgICAgc3dpdGNoIChqb2luLnN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmljdFwiOlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpY3Qgam9pbiBmYWlsZWQgYmVjYXVzZSBsaXN0ZW5lciB0cmlnZ2VyZWQgdHdpY2UuXCIpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsYXN0XCI6XG4gICAgICAgICAgICAgICAgICAgIGpvaW4uYXJnc1tpXSA9IGNhbGxhcmdzO2JyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJhbGxcIjpcbiAgICAgICAgICAgICAgICAgICAgam9pbi5hcmdzW2ldLnB1c2goY2FsbGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgam9pbi5saXN0ZW5hYmxlc0VtaXR0ZWRbaV0gPSB0cnVlO1xuICAgICAgICAgICAgam9pbi5hcmdzW2ldID0gam9pbi5zdHJhdGVneSA9PT0gXCJhbGxcIiA/IFtjYWxsYXJnc10gOiBjYWxsYXJncztcbiAgICAgICAgfVxuICAgICAgICBlbWl0SWZBbGxMaXN0ZW5hYmxlc0VtaXR0ZWQoam9pbik7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZW1pdElmQWxsTGlzdGVuYWJsZXNFbWl0dGVkKGpvaW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGpvaW4ubnVtYmVyT2ZMaXN0ZW5hYmxlczsgaSsrKSB7XG4gICAgICAgIGlmICgham9pbi5saXN0ZW5hYmxlc0VtaXR0ZWRbaV0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBqb2luLmNhbGxiYWNrLmFwcGx5KGpvaW4ubGlzdGVuZXIsIGpvaW4uYXJncyk7XG4gICAgcmVzZXQoam9pbik7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWl4KGRlZikge1xuICAgIHZhciBjb21wb3NlZCA9IHtcbiAgICAgICAgaW5pdDogW10sXG4gICAgICAgIHByZUVtaXQ6IFtdLFxuICAgICAgICBzaG91bGRFbWl0OiBbXVxuICAgIH07XG5cbiAgICB2YXIgdXBkYXRlZCA9IChmdW5jdGlvbiBtaXhEZWYobWl4aW4pIHtcbiAgICAgICAgdmFyIG1peGVkID0ge307XG4gICAgICAgIGlmIChtaXhpbi5taXhpbnMpIHtcbiAgICAgICAgICAgIG1peGluLm1peGlucy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJNaXhpbikge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKG1peGVkLCBtaXhEZWYoc3ViTWl4aW4pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIF8uZXh0ZW5kKG1peGVkLCBtaXhpbik7XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbXBvc2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChjb21wb3NhYmxlKSB7XG4gICAgICAgICAgICBpZiAobWl4aW4uaGFzT3duUHJvcGVydHkoY29tcG9zYWJsZSkpIHtcbiAgICAgICAgICAgICAgICBjb21wb3NlZFtjb21wb3NhYmxlXS5wdXNoKG1peGluW2NvbXBvc2FibGVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtaXhlZDtcbiAgICB9KShkZWYpO1xuXG4gICAgaWYgKGNvbXBvc2VkLmluaXQubGVuZ3RoID4gMSkge1xuICAgICAgICB1cGRhdGVkLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIGNvbXBvc2VkLmluaXQuZm9yRWFjaChmdW5jdGlvbiAoaW5pdCkge1xuICAgICAgICAgICAgICAgIGluaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbXBvc2VkLnByZUVtaXQubGVuZ3RoID4gMSkge1xuICAgICAgICB1cGRhdGVkLnByZUVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9zZWQucHJlRW1pdC5yZWR1Y2UoKGZ1bmN0aW9uIChhcmdzLCBwcmVFbWl0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gcHJlRW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3VmFsdWUgPT09IHVuZGVmaW5lZCA/IGFyZ3MgOiBbbmV3VmFsdWVdO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbXBvc2VkLnNob3VsZEVtaXQubGVuZ3RoID4gMSkge1xuICAgICAgICB1cGRhdGVkLnNob3VsZEVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiAhY29tcG9zZWQuc2hvdWxkRW1pdC5zb21lKGZ1bmN0aW9uIChzaG91bGRFbWl0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFzaG91bGRFbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKGNvbXBvc2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChjb21wb3NhYmxlKSB7XG4gICAgICAgIGlmIChjb21wb3NlZFtjb21wb3NhYmxlXS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHVwZGF0ZWRbY29tcG9zYWJsZV0gPSBjb21wb3NlZFtjb21wb3NhYmxlXVswXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNhcGl0YWxpemUgPSBjYXBpdGFsaXplO1xuZXhwb3J0cy5jYWxsYmFja05hbWUgPSBjYWxsYmFja05hbWU7XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5leHBvcnRzLm9iamVjdCA9IG9iamVjdDtcbmV4cG9ydHMuaXNBcmd1bWVudHMgPSBpc0FyZ3VtZW50cztcbmV4cG9ydHMudGhyb3dJZiA9IHRocm93SWY7XG5cbmZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcbn1cblxuZnVuY3Rpb24gY2FsbGJhY2tOYW1lKHN0cmluZywgcHJlZml4KSB7XG4gICAgcHJlZml4ID0gcHJlZml4IHx8IFwib25cIjtcbiAgICByZXR1cm4gcHJlZml4ICsgZXhwb3J0cy5jYXBpdGFsaXplKHN0cmluZyk7XG59XG5cbnZhciBlbnZpcm9ubWVudCA9IHt9O1xuXG5leHBvcnRzLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnQ7XG5mdW5jdGlvbiBjaGVja0Vudih0YXJnZXQpIHtcbiAgICB2YXIgZmxhZyA9IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgICAvKmVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgaWYgKGV2YWwodGFyZ2V0KSkge1xuICAgICAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLyplc2xpbnQtZW5hYmxlIG5vLWV2YWwgKi9cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICB9XG4gICAgZW52aXJvbm1lbnRbY2FsbGJhY2tOYW1lKHRhcmdldCwgXCJoYXNcIildID0gZmxhZztcbn1cbmNoZWNrRW52KFwic2V0SW1tZWRpYXRlXCIpO1xuY2hlY2tFbnYoXCJQcm9taXNlXCIpO1xuXG4vKlxuICogaXNPYmplY3QsIGV4dGVuZCwgaXNGdW5jdGlvbiwgaXNBcmd1bWVudHMgYXJlIHRha2VuIGZyb20gdW5kZXNjb3JlL2xvZGFzaCBpblxuICogb3JkZXIgdG8gcmVtb3ZlIHRoZSBkZXBlbmRlbmN5XG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZSA9PT0gXCJvYmplY3RcIiAmJiAhIW9iajtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHByb3ApO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIHByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG5leHBvcnRzLkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJldmVudGVtaXR0ZXIzXCIpO1xuXG5pZiAoZW52aXJvbm1lbnQuaGFzU2V0SW1tZWRpYXRlKSB7XG4gICAgZXhwb3J0cy5uZXh0VGljayA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBzZXRJbW1lZGlhdGUoY2FsbGJhY2spO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGV4cG9ydHMubmV4dFRpY2sgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gb2JqZWN0KGtleXMsIHZhbHMpIHtcbiAgICB2YXIgbyA9IHt9LFxuICAgICAgICBpID0gMDtcbiAgICBmb3IgKDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgb1trZXlzW2ldXSA9IHZhbHNbaV07XG4gICAgfVxuICAgIHJldHVybiBvO1xufVxuXG5pZiAoZW52aXJvbm1lbnQuaGFzUHJvbWlzZSkge1xuICAgIGV4cG9ydHMuUHJvbWlzZSA9IFByb21pc2U7XG4gICAgZXhwb3J0cy5jcmVhdGVQcm9taXNlID0gZnVuY3Rpb24gKHJlc29sdmVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgZXhwb3J0cy5Qcm9taXNlKHJlc29sdmVyKTtcbiAgICB9O1xufSBlbHNlIHtcbiAgICBleHBvcnRzLlByb21pc2UgPSBudWxsO1xuICAgIGV4cG9ydHMuY3JlYXRlUHJvbWlzZSA9IGZ1bmN0aW9uICgpIHt9O1xufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgXCJjYWxsZWVcIiBpbiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09PSBcIm51bWJlclwiO1xufVxuXG5mdW5jdGlvbiB0aHJvd0lmKHZhbCwgbXNnKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgICB0aHJvdyBFcnJvcihtc2cgfHwgdmFsKTtcbiAgICB9XG59IiwidmFyIF8gPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvdXRpbHMnKSxcbiAgICBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzJyk7XG5cbi8qKlxuICogQSBtb2R1bGUgbWVhbnQgdG8gYmUgY29uc3VtZWQgYXMgYSBtaXhpbiBieSBhIFJlYWN0IGNvbXBvbmVudC4gU3VwcGxpZXMgdGhlIG1ldGhvZHMgZnJvbVxuICogYExpc3RlbmVyTWV0aG9kc2AgbWl4aW4gYW5kIHRha2VzIGNhcmUgb2YgdGVhcmRvd24gb2Ygc3Vic2NyaXB0aW9ucy5cbiAqIE5vdGUgdGhhdCBpZiB5b3UncmUgdXNpbmcgdGhlIGBjb25uZWN0YCBtaXhpbiB5b3UgZG9uJ3QgbmVlZCB0aGlzIG1peGluLCBhcyBjb25uZWN0IHdpbGxcbiAqIGltcG9ydCBldmVyeXRoaW5nIHRoaXMgbWl4aW4gY29udGFpbnMhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gXy5leHRlbmQoe1xuXG4gICAgLyoqXG4gICAgICogQ2xlYW5zIHVwIGFsbCBsaXN0ZW5lciBwcmV2aW91c2x5IHJlZ2lzdGVyZWQuXG4gICAgICovXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IExpc3RlbmVyTWV0aG9kcy5zdG9wTGlzdGVuaW5nVG9BbGxcblxufSwgTGlzdGVuZXJNZXRob2RzKTtcbiIsInZhciBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzJyksXG4gICAgTGlzdGVuZXJNaXhpbiA9IHJlcXVpcmUoJy4vTGlzdGVuZXJNaXhpbicpLFxuICAgIF8gPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0ZW5hYmxlLGtleSl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5vYmplY3QoW2tleV0sW2xpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKCldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBfLmV4dGVuZCh0aGlzLExpc3RlbmVyTWV0aG9kcyk7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzLCBjYiA9IChrZXkgPT09IHVuZGVmaW5lZCA/IHRoaXMuc2V0U3RhdGUgOiBmdW5jdGlvbih2KXtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lLmlzTW91bnRlZCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBtZS5pc01vdW50ZWQoKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtZS5zZXRTdGF0ZShfLm9iamVjdChba2V5XSxbdl0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZSxjYik7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1peGluLmNvbXBvbmVudFdpbGxVbm1vdW50XG4gICAgfTtcbn07XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpLFxuICAgIExpc3RlbmVyTWl4aW4gPSByZXF1aXJlKCcuL0xpc3RlbmVyTWl4aW4nKSxcbiAgICBfID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZSwga2V5LCBmaWx0ZXJGdW5jKSB7XG4gICAgZmlsdGVyRnVuYyA9IF8uaXNGdW5jdGlvbihrZXkpID8ga2V5IDogZmlsdGVyRnVuYztcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24oa2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJGdW5jLmNhbGwodGhpcywgbGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZpbHRlciBpbml0aWFsIHBheWxvYWQgZnJvbSBzdG9yZS5cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZmlsdGVyRnVuYy5jYWxsKHRoaXMsIGxpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocmVzdWx0KSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5vYmplY3QoW2tleV0sIFtyZXN1bHRdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmV4dGVuZCh0aGlzLCBMaXN0ZW5lck1ldGhvZHMpO1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIHZhciBjYiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lLnNldFN0YXRlKGZpbHRlckZ1bmMuY2FsbChtZSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZmlsdGVyRnVuYy5jYWxsKG1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG1lLnNldFN0YXRlKF8ub2JqZWN0KFtrZXldLCBbcmVzdWx0XSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZSwgY2IpO1xuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudDogTGlzdGVuZXJNaXhpbi5jb21wb25lbnRXaWxsVW5tb3VudFxuICAgIH07XG59O1xuXG4iLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4LWNvcmUnKTtcblxuUmVmbHV4LmNvbm5lY3QgPSByZXF1aXJlKCcuL2Nvbm5lY3QnKTtcblxuUmVmbHV4LmNvbm5lY3RGaWx0ZXIgPSByZXF1aXJlKCcuL2Nvbm5lY3RGaWx0ZXInKTtcblxuUmVmbHV4Lkxpc3RlbmVyTWl4aW4gPSByZXF1aXJlKCcuL0xpc3RlbmVyTWl4aW4nKTtcblxuUmVmbHV4Lmxpc3RlblRvID0gcmVxdWlyZSgnLi9saXN0ZW5UbycpO1xuXG5SZWZsdXgubGlzdGVuVG9NYW55ID0gcmVxdWlyZSgnLi9saXN0ZW5Ub01hbnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZsdXg7XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpO1xuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYExpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gKiAgbGlzdGVuZWQgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGRlZmF1bHQgaGFuZGxlclxuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBsaXN0ZW5hYmxlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB1cCB0aGUgbWl4aW4gYmVmb3JlIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvY2N1cnMuIEltcG9ydCBtZXRob2RzIGZyb20gYExpc3RlbmVyTWV0aG9kc2BcbiAgICAgICAgICogYW5kIHRoZW4gbWFrZSB0aGUgY2FsbCB0byBgbGlzdGVuVG9gIHdpdGggdGhlIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZmFjdG9yeSBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yKHZhciBtIGluIExpc3RlbmVyTWV0aG9kcyl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0gIT09IExpc3RlbmVyTWV0aG9kc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2FuJ3QgaGF2ZSBvdGhlciBwcm9wZXJ0eSAnXCIrbStcIicgd2hlbiB1c2luZyBSZWZsdXgubGlzdGVuVG8hXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpc1ttXSA9IExpc3RlbmVyTWV0aG9kc1ttXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1ldGhvZHMuc3RvcExpc3RlbmluZ1RvQWxsXG4gICAgfTtcbn07XG4iLCJ2YXIgTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgncmVmbHV4LWNvcmUvbGliL0xpc3RlbmVyTWV0aG9kcycpO1xuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYGxpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuIFRoaXMgdmVyc2lvbiBpcyB1c2VkXG4gKiB0byBhdXRvbWF0aWNhbGx5IHNldCB1cCBhIGBsaXN0ZW5Ub01hbnlgIGNhbGwuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGVzIEFuIG9iamVjdCBvZiBsaXN0ZW5hYmxlc1xuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZXMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdXAgdGhlIG1peGluIGJlZm9yZSB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2NjdXJzLiBJbXBvcnQgbWV0aG9kcyBmcm9tIGBMaXN0ZW5lck1ldGhvZHNgXG4gICAgICAgICAqIGFuZCB0aGVuIG1ha2UgdGhlIGNhbGwgdG8gYGxpc3RlblRvYCB3aXRoIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGZhY3RvcnkgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcih2YXIgbSBpbiBMaXN0ZW5lck1ldGhvZHMpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzW21dICE9PSBMaXN0ZW5lck1ldGhvZHNbbV0pe1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNhbid0IGhhdmUgb3RoZXIgcHJvcGVydHkgJ1wiK20rXCInIHdoZW4gdXNpbmcgUmVmbHV4Lmxpc3RlblRvTWFueSFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzW21dID0gTGlzdGVuZXJNZXRob2RzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9NYW55KGxpc3RlbmFibGVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFucyB1cCBhbGwgbGlzdGVuZXIgcHJldmlvdXNseSByZWdpc3RlcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQ6IExpc3RlbmVyTWV0aG9kcy5zdG9wTGlzdGVuaW5nVG9BbGxcbiAgICB9O1xufTtcbiJdfQ==
