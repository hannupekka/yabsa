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
var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    PaymentWrapper = require('./components/paymentwrapper.jsx'),
    routes = (
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
            React.createElement("div", {className: "paymentList__transaction clearfix"}, 
                React.createElement("div", {className: "transaction__amount"}, 
                    React.createElement(FormattedNumber, {value: this.props.amount, style: "currency", currency: "EUR"}), React.createElement("i", {className: "fa fa-long-arrow-right"}), this.props.to
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
                React.createElement("div", {key: i, className: "paymentList__payment clearfix col-md-4"}, 
                    React.createElement("div", {className: "paymentList__from"}, payment.name, " pays:"), 
                    React.createElement("div", {className: "paymentList__transactions clearfix bg-primary"}, 
                        personsPayments
                    )
                )
            );
        }),
            className = Object.keys(this.state.persons.payments).length > 0 ? 'clearfix' : 'hidden';

        return (
            React.createElement("div", {id: "paymentList", className: className}, 
                React.createElement("div", {className: "stats col-xs-12"}, 
                    React.createElement("b", null, "Total: "), " ", React.createElement(FormattedNumber, {value: this.state.persons.total, style: "currency", currency: this.state.settings.currency}), " ", React.createElement("br", null), 
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

        var results = shareBill(this.getData(this.state.persons.personList));

        PersonActions.shareTotal(results);
    },
    saveBill: function (event) {
        if (event) {
            event.preventDefault();
        }

        var baseUrl = window.location.origin,
            router = this.context.router,
            bid = router.getCurrentParams().bid,
            method = bid ? 'PUT' : 'POST',
            url = bid ? '/bill/' + bid : '/bill',
            results = shareBill(this.getData(this.state.persons.personList));

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
        var disabled = this.state.validation.valid ? undefined : 'disabled',
            saveButton =
            function () {
                if (Object.keys(this.state.persons.payments).length > 0) {
                    return (
                        React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.saveBill, disabled: disabled}, React.createElement("i", {className: "fa fa-floppy-o"}), React.createElement("span", {className: "hidden-xs"}, " Save bill"))
                    );
                }
            }.bind(this),
            deleteButton =
            function () {
                var bid = this.context.router.getCurrentParams().bid;
                if (bid) {
                    return (
                        React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.deleteBill}, React.createElement("i", {className: "fa fa-trash-o"}), React.createElement("span", {className: "hidden-xs"}, " Delete bill"))
                    );
                }
            }.bind(this);

        return (
            React.createElement("div", null, 
                React.createElement(Settings, null), 
                React.createElement(PersonList, null), 
                React.createElement("div", {className: "buttons main"}, 
                    React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.addPerson}, React.createElement("i", {className: "fa fa-user-plus"}), React.createElement("span", {className: "hidden-xs"}, " Add person")), 
                    React.createElement("button", {className: "btn btn-sm btn-primary settings", onClick: this.toggleSettings}, React.createElement("i", {className: "fa fa-cog"}), React.createElement("span", {className: "hidden-xs"}, " Settings")), 
                    React.createElement("button", {className: "btn btn-sm btn-primary", onClick: this.shareTotal, disabled: disabled}, React.createElement("i", {className: "fa fa-calculator"}), React.createElement("span", {className: "hidden-xs"}, " Share total"))
                ), 
                React.createElement(PaymentList, null), 
                React.createElement("div", {className: "col-xs-12 buttons"}, 
                    saveButton(), 
                    deleteButton()
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
    keyDown: function (event) {
        if (event.which === 9) {
            PersonActions.addPerson();
        }
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
                        React.createElement("input", {type: "tel", className: "form-control input-lg", placeholder: "0", value: this.setPaid(), onChange: this.handleChange.bind(this, 'paid'), onKeyDown: this.keyDown}), 
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
                React.createElement("div", {id: "help"}, "Protip: you can enter multiple amounts for person by separating them by space!")
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
var sortBy = require('lodash.sortby'),
    each = require('lodash.foreach'),
    reduce = require('lodash.reduce'),
    find = require('lodash.find'),
    remove = require('lodash.remove');

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
var Reflux = require('reflux'),
    PersonActions = require('../actions/personactions.js'),
    Data = function () {
        return {
            personList: [],
            payments: {},
            total: 0,
            share: 0
        }
    },
    PersonStore = Reflux.createStore({
        listenables: [PersonActions],
        persons: new Data(),
        init: function () {
            this.addPerson();
        },
        getInitialState: function () {
            return this.persons;
        },
        addPerson: function () {
            this.persons.personList.push({
                name: undefined,
                paid: undefined
            });
            this.trigger(this.persons);
        },
        editPerson: function (field, value, idx) {
            this.persons.personList[idx][field] = value;
            if (this.persons.personList[idx].pristine) {
                delete this.persons.personList[idx].pristine;
            }
            this.trigger(this.persons);
        },
        deletePerson: function (idx) {
            this.persons.personList.splice(idx, 1);
            this.trigger(this.persons);
        },
        shareTotal: function (results) {
            this.persons.payments = results.payments;
            this.persons.total = results.total;
            this.persons.share = results.share;
            this.trigger(this.persons);
        },
        setPersons: function (persons) {
            this.persons.personList = persons;
            this.trigger(this.persons);
        },
        reset: function () {
            this.persons = new Data();
            this.addPerson();
            this.trigger(this.persons);
        }
    });

module.exports = PersonStore;

},{"../actions/personactions.js":1,"reflux":31}],13:[function(require,module,exports){
var Reflux = require('reflux'),
    SettingActions = require('../actions/settingactions.js'),
    Settings = function () {
        return {
            visible: false,
            currency: 'EUR',
            bid: undefined
        }
    },
    SettingStore = Reflux.createStore({
        listenables: [SettingActions],
        settings: new Settings(),
        getInitialState: function () {
            return this.settings;
        },
        toggleVisibility: function () {
            this.settings.visible = !this.settings.visible;
            this.trigger(this.settings);
        },
        setCurrency: function (currency) {
            this.settings.currency = currency;
            this.trigger(this.settings);
        },
        setBid: function (bid) {
            this.settings.bid = bid;
            this.trigger(this.settings);
        },
        reset: function () {
            this.settings = new Settings();
            this.trigger(this.settings);
        }
    });

module.exports = SettingStore;

},{"../actions/settingactions.js":2,"reflux":31}],14:[function(require,module,exports){
var Reflux = require('reflux'),
    ValidateActions = require('../actions/validateactions.js'),
    PersonStore = require('./personstore.js'),
    ValidateStore = Reflux.createStore({
        listenables: [ValidateActions],
        results: {
            persons: [],
            valid: false
        },
        init: function () {
            this.listenTo(PersonStore, this.validateForm, this.validateInitialForm);
        },
        getInitialState: function () {
            return this.results;
        },
        validateInitialForm: function (persons) {
            this.results.persons = this.parsePersons(persons, true);
            this.trigger(this.results);
        },
        validateForm: function (persons) {
            this.results.persons = this.parsePersons(persons, false);

            this.results.valid = this.results.persons.every(function (person) {
                return person.name === true && person.paid === true;
            });

            this.trigger(this.results);
        },
        parsePersons: function (persons, initial) {
            return persons.personList.map(function (person, i) {
                var isNameValid = initial,
                    isPaidValid = initial;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYWN0aW9ucy92YWxpZGF0ZWFjdGlvbnMuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvYXBwLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGF5bWVudC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50bGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wYXltZW50d3JhcHBlci5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9wZXJzb24uanN4IiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29ubGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvY29tcG9uZW50cy9zZXR0aW5ncy5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL2NsaWVudC9zcmMvanMvZnVuY3Rpb25zLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL3N0b3Jlcy9wZXJzb25zdG9yZS5qcyIsIi92YXIvd3d3L2Rldi9iaWxsZXIvY2xpZW50L3NyYy9qcy9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzIiwiL3Zhci93d3cvZGV2L2JpbGxlci9jbGllbnQvc3JjL2pzL3N0b3Jlcy92YWxpZGF0ZXN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9BY3Rpb25NZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL0tlZXAuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L25vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL1B1Ymxpc2hlck1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L25vZGVfbW9kdWxlcy9yZWZsdXgtY29yZS9saWIvU3RvcmVNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL2JpbmRNZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvcmVmbHV4LWNvcmUvbGliL2NyZWF0ZUFjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9qb2lucy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi9taXhlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvbm9kZV9tb2R1bGVzL3JlZmx1eC1jb3JlL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL0xpc3RlbmVyTWl4aW4uanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9jb25uZWN0LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvY29ubmVjdEZpbHRlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvbGlzdGVuVG8uanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9saXN0ZW5Ub01hbnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQzFCLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ2pDLFdBQVc7UUFDWCxZQUFZO1FBQ1osY0FBYztRQUNkLFlBQVk7UUFDWixZQUFZO1FBQ1osT0FBTztBQUNmLEtBQUssQ0FBQyxDQUFDOztBQUVQLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7QUNWL0IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUMxQixjQUFjLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUNsQyxrQkFBa0I7UUFDbEIsYUFBYTtRQUNiLFFBQVE7UUFDUixPQUFPO0FBQ2YsS0FBSyxDQUFDLENBQUM7O0FBRVAsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7OztBQ1JoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzlCLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRS9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDOzs7QUNIakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUN4QixNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztJQUNoQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUs7SUFDcEIsY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQztJQUMzRCxNQUFNO1FBQ0Ysb0JBQUMsS0FBSyxFQUFBLENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4JyksXG4gICAgUGVyc29uQWN0aW9ucyA9IFJlZmx1eC5jcmVhdGVBY3Rpb25zKFtcbiAgICAgICAgJ2FkZFBlcnNvbicsXG4gICAgICAgICdlZGl0UGVyc29uJyxcbiAgICAgICAgJ2RlbGV0ZVBlcnNvbicsXG4gICAgICAgICdzaGFyZVRvdGFsJyxcbiAgICAgICAgJ3NldFBlcnNvbnMnLFxuICAgICAgICAncmVzZXQnXG4gICAgXSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uQWN0aW9ucztcbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBTZXR0aW5nQWN0aW9ucyA9IFJlZmx1eC5jcmVhdGVBY3Rpb25zKFtcbiAgICAgICAgJ3RvZ2dsZVZpc2liaWxpdHknLFxuICAgICAgICAnc2V0Q3VycmVuY3knLFxuICAgICAgICAnc2V0QmlkJyxcbiAgICAgICAgJ3Jlc2V0J1xuICAgIF0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdBY3Rpb25zO1xuIiwidmFyIFJlZmx1eCA9IHJlcXVpcmUoJ3JlZmx1eCcpLFxuICAgIFZhbGlkYXRlQWN0aW9ucyA9IFJlZmx1eC5jcmVhdGVBY3Rpb25zKFtdKTtcblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0ZUFjdGlvbnM7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpLFxuICAgIFJvdXRlID0gUm91dGVyLlJvdXRlLFxuICAgIFBheW1lbnRXcmFwcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCcpLFxuICAgIHJvdXRlcyA9IChcbiAgICAgICAgPFJvdXRlIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfT5cbiAgICAgICAgICAgIDxSb3V0ZSBuYW1lPVwiaW5kZXhcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgICAgICAgICA8Um91dGUgbmFtZT1cImJpbGxcIiBwYXRoPVwiLzpiaWRcIiBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0vPlxuICAgICAgICA8L1JvdXRlPlxuICAgICk7XG5cblJvdXRlci5ydW4ocm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICAgIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3JhcHBlcicpKTtcbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJlYWN0SW50bCA9IHJlcXVpcmUoJ3JlYWN0LWludGwnKSxcbiAgICBJbnRsTWl4aW4gPSBSZWFjdEludGwuSW50bE1peGluLFxuICAgIEZvcm1hdHRlZE51bWJlciA9IFJlYWN0SW50bC5Gb3JtYXR0ZWROdW1iZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW0ludGxNaXhpbl0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX3RyYW5zYWN0aW9uIGNsZWFyZml4Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndHJhbnNhY3Rpb25fX2Ftb3VudCc+XG4gICAgICAgICAgICAgICAgICAgIDxGb3JtYXR0ZWROdW1iZXIgdmFsdWU9e3RoaXMucHJvcHMuYW1vdW50fSBzdHlsZT1cImN1cnJlbmN5XCIgY3VycmVuY3k9XCJFVVJcIiAvPjxpIGNsYXNzTmFtZT0nZmEgZmEtbG9uZy1hcnJvdy1yaWdodCc+PC9pPnt0aGlzLnByb3BzLnRvfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4JyksXG4gICAgUGF5bWVudCA9IHJlcXVpcmUoJy4vcGF5bWVudC5qc3gnKSxcbiAgICBSZWFjdEludGwgPSByZXF1aXJlKCdyZWFjdC1pbnRsJyksXG4gICAgSW50bE1peGluID0gUmVhY3RJbnRsLkludGxNaXhpbixcbiAgICBGb3JtYXR0ZWROdW1iZXIgPSBSZWFjdEludGwuRm9ybWF0dGVkTnVtYmVyLFxuICAgIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyksXG4gICAgU2V0dGluZ1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3NldHRpbmdzdG9yZS5qcycpLFxuICAgIG1hcCA9IHJlcXVpcmUoJ2xvZGFzaC5tYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbXG4gICAgICAgIEludGxNaXhpbixcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoUGVyc29uU3RvcmUsICdwZXJzb25zJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFNldHRpbmdTdG9yZSwgJ3NldHRpbmdzJylcbiAgICBdLFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGF5bWVudHMgPSBtYXAodGhpcy5zdGF0ZS5wZXJzb25zLnBheW1lbnRzLCBmdW5jdGlvbiAocGF5bWVudCwgaSkge1xuICAgICAgICAgICAgdmFyIHBlcnNvbnNQYXltZW50cyA9IHBheW1lbnQudG8ubWFwKGZ1bmN0aW9uIChwLCBqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPFBheW1lbnQga2V5PXtqfSB0bz17cC50b30gYW1vdW50PXtwLmFtb3VudH0gLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX3BheW1lbnQgY2xlYXJmaXggY29sLW1kLTQnPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX2Zyb20nPntwYXltZW50Lm5hbWV9IHBheXM6PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYXltZW50TGlzdF9fdHJhbnNhY3Rpb25zIGNsZWFyZml4IGJnLXByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAge3BlcnNvbnNQYXltZW50c31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KSxcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUucGVyc29ucy5wYXltZW50cykubGVuZ3RoID4gMCA/ICdjbGVhcmZpeCcgOiAnaGlkZGVuJztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBpZD0ncGF5bWVudExpc3QnIGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc3RhdHMgY29sLXhzLTEyJz5cbiAgICAgICAgICAgICAgICAgICAgPGI+VG90YWw6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5zdGF0ZS5wZXJzb25zLnRvdGFsfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGI+U2hhcmU6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5zdGF0ZS5wZXJzb25zLnNoYXJlfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7cGF5bWVudHN9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBQZXJzb25MaXN0ID0gcmVxdWlyZSgnLi9wZXJzb25saXN0LmpzeCcpLFxuICAgIFBheW1lbnRMaXN0ID0gcmVxdWlyZSgnLi9wYXltZW50bGlzdC5qc3gnKSxcbiAgICBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MuanN4JyksXG4gICAgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyksXG4gICAgUGVyc29uQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvcGVyc29uYWN0aW9ucy5qcycpLFxuICAgIFNldHRpbmdBY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9zZXR0aW5nYWN0aW9ucy5qcycpLFxuICAgIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbnN0b3JlLmpzJyksXG4gICAgVmFsaWRhdGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy92YWxpZGF0ZXN0b3JlLmpzJyksXG4gICAgU2V0dGluZ1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3NldHRpbmdzdG9yZS5qcycpLFxuICAgIHJlcXVlc3QgPSByZXF1aXJlKCdicm93c2VyLXJlcXVlc3QnKSxcbiAgICBzaGFyZUJpbGwgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFBlcnNvblN0b3JlLCAncGVyc29ucycpLFxuICAgICAgICBSZWZsdXguY29ubmVjdChWYWxpZGF0ZVN0b3JlLCAndmFsaWRhdGlvbicpLFxuICAgICAgICBSZWZsdXguY29ubmVjdChTZXR0aW5nU3RvcmUsICdzZXR0aW5ncycpXG4gICAgXSxcbiAgICBjb250ZXh0VHlwZXM6IHtcbiAgICAgICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICAgICAgYmlkID0gdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkuYmlkO1xuICAgICAgICBpZiAoYmlkKSB7XG4gICAgICAgICAgICByZXF1ZXN0KGJhc2VVcmwgKyAnL2FwaS92MS9iaWxsLycgKyBiaWQsIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKCdpbmRleCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShib2R5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBzaGFyZUJpbGwodGhpcy5nZXREYXRhKGRhdGEuZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBQZXJzb25BY3Rpb25zLnNldFBlcnNvbnMoZGF0YS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZ0FjdGlvbnMuc2V0Q3VycmVuY3koZGF0YS5jdXJyZW5jeSk7XG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbkFjdGlvbnMuc2hhcmVUb3RhbChyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBQZXJzb25BY3Rpb25zLmFkZFBlcnNvbigpO1xuICAgIH0sXG4gICAgdG9nZ2xlU2V0dGluZ3M6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBTZXR0aW5nQWN0aW9ucy50b2dnbGVWaXNpYmlsaXR5KCk7XG4gICAgfSxcbiAgICBzaGFyZVRvdGFsOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0gc2hhcmVCaWxsKHRoaXMuZ2V0RGF0YSh0aGlzLnN0YXRlLnBlcnNvbnMucGVyc29uTGlzdCkpO1xuXG4gICAgICAgIFBlcnNvbkFjdGlvbnMuc2hhcmVUb3RhbChyZXN1bHRzKTtcbiAgICB9LFxuICAgIHNhdmVCaWxsOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICAgICAgcm91dGVyID0gdGhpcy5jb250ZXh0LnJvdXRlcixcbiAgICAgICAgICAgIGJpZCA9IHJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkuYmlkLFxuICAgICAgICAgICAgbWV0aG9kID0gYmlkID8gJ1BVVCcgOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgPSBiaWQgPyAnL2JpbGwvJyArIGJpZCA6ICcvYmlsbCcsXG4gICAgICAgICAgICByZXN1bHRzID0gc2hhcmVCaWxsKHRoaXMuZ2V0RGF0YSh0aGlzLnN0YXRlLnBlcnNvbnMucGVyc29uTGlzdCkpO1xuXG4gICAgICAgIHJlcXVlc3Qoe3VybDogYmFzZVVybCArICcvYXBpL3YxJyArIHVybCwgbWV0aG9kOiBtZXRob2QsIGJvZHk6IHtkYXRhOiB0aGlzLnN0YXRlLnBlcnNvbnMucGVyc29uTGlzdCwgY3VycmVuY3k6IHRoaXMuc3RhdGUuc2V0dGluZ3MuY3VycmVuY3l9LCBqc29uOiB0cnVlfSwgZnVuY3Rpb24gKGVycm9yLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICAgICAgaWYgKCFiaWQpIHtcbiAgICAgICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5zZXRCaWQoYm9keS5iaWQpO1xuICAgICAgICAgICAgICAgIHJvdXRlci50cmFuc2l0aW9uVG8oJ2JpbGwnLCB7YmlkOiBib2R5LmJpZH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgZGVsZXRlQmlsbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbixcbiAgICAgICAgICAgIHJvdXRlciA9IHRoaXMuY29udGV4dC5yb3V0ZXIsXG4gICAgICAgICAgICBiaWQgPSByb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmJpZDtcblxuICAgICAgICByZXF1ZXN0KHt1cmw6IGJhc2VVcmwgKyAnL2FwaS92MS9iaWxsLycgKyBiaWQsIG1ldGhvZDogJ0RFTEVURSd9LCBmdW5jdGlvbiAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICBQZXJzb25BY3Rpb25zLnJlc2V0KCk7XG4gICAgICAgICAgICBTZXR0aW5nQWN0aW9ucy5yZXNldCgpO1xuICAgICAgICAgICAgcm91dGVyLnRyYW5zaXRpb25UbygnaW5kZXgnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIGdldERhdGE6IGZ1bmN0aW9uIChwZXJzb25zKSB7XG4gICAgICAgIHZhciBkYXRhID0gW10sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIHBlcnNvbkNvdW50ID0gcGVyc29ucy5sZW5ndGgsXG4gICAgICAgICAgICBwZXJzb24sXG4gICAgICAgICAgICBwYWlkO1xuICAgICAgICBmb3IgKDsgaSA8IHBlcnNvbkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHBlcnNvbiA9IHBlcnNvbnNbaV07XG4gICAgICAgICAgICAvLyBTdW0gYW1vdW50cyBpZiBtdWx0aXBsZSBnaXZlbi4gQWxzbyByZXBsYWNlIGNvbW1hcy5cbiAgICAgICAgICAgIHBhaWQgPSB0eXBlb2YgcGVyc29uLnBhaWQgPT09ICdzdHJpbmcnID8gcGVyc29uLnBhaWQuc3BsaXQoJyAnKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHByZXYpICsgTnVtYmVyKGN1cnJlbnQucmVwbGFjZSgnLCcsICcuJykpO1xuICAgICAgICAgICAgfSwgMCkgOiBwZXJzb24ucGFpZDtcbiAgICAgICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogcGVyc29uLm5hbWUsXG4gICAgICAgICAgICAgICAgcGFpZDogTnVtYmVyKHBhaWQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IHRoaXMuc3RhdGUudmFsaWRhdGlvbi52YWxpZCA/IHVuZGVmaW5lZCA6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBzYXZlQnV0dG9uID1cbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5zdGF0ZS5wZXJzb25zLnBheW1lbnRzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tcHJpbWFyeScgb25DbGljaz17dGhpcy5zYXZlQmlsbH0gZGlzYWJsZWQ9e2Rpc2FibGVkfT48aSBjbGFzc05hbWU9J2ZhIGZhLWZsb3BweS1vJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBTYXZlIGJpbGw8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZGVsZXRlQnV0dG9uID1cbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYmlkID0gdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkuYmlkO1xuICAgICAgICAgICAgICAgIGlmIChiaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLmRlbGV0ZUJpbGx9PjxpIGNsYXNzTmFtZT0nZmEgZmEtdHJhc2gtbyc+PC9pPjxzcGFuIGNsYXNzTmFtZT0naGlkZGVuLXhzJz4gRGVsZXRlIGJpbGw8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxTZXR0aW5ncyAvPlxuICAgICAgICAgICAgICAgIDxQZXJzb25MaXN0IC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2J1dHRvbnMgbWFpbic+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLmFkZFBlcnNvbn0+PGkgY2xhc3NOYW1lPSdmYSBmYS11c2VyLXBsdXMnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IEFkZCBwZXJzb248L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1wcmltYXJ5IHNldHRpbmdzJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVNldHRpbmdzfT48aSBjbGFzc05hbWU9J2ZhIGZhLWNvZyc+PC9pPjxzcGFuIGNsYXNzTmFtZT0naGlkZGVuLXhzJz4gU2V0dGluZ3M8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLnNoYXJlVG90YWx9IGRpc2FibGVkPXtkaXNhYmxlZH0+PGkgY2xhc3NOYW1lPSdmYSBmYS1jYWxjdWxhdG9yJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBTaGFyZSB0b3RhbDwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8UGF5bWVudExpc3QgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTEyIGJ1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICB7c2F2ZUJ1dHRvbigpfVxuICAgICAgICAgICAgICAgICAgICB7ZGVsZXRlQnV0dG9uKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBQZXJzb25BY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzJyksXG4gICAgVmFsaWRhdGVBY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy92YWxpZGF0ZWFjdGlvbnMuanMnKSxcbiAgICBQZXJzb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZXJzb25zdG9yZS5qcycpLFxuICAgIFZhbGlkYXRlU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdmFsaWRhdGVzdG9yZS5qcycpLFxuICAgIFNldHRpbmdTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zZXR0aW5nc3RvcmUuanMnKSxcbiAgICBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtcbiAgICAgICAgUmVmbHV4LmNvbm5lY3QoUGVyc29uU3RvcmUsICdwZXJzb25zJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFZhbGlkYXRlU3RvcmUsICd2YWxpZGF0aW9uJyksXG4gICAgICAgIFJlZmx1eC5jb25uZWN0KFNldHRpbmdTdG9yZSwgJ3NldHRpbmdzJylcbiAgICBdLFxuICAgIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24gKGZpZWxkLCBldmVudCkge1xuICAgICAgICBQZXJzb25BY3Rpb25zLmVkaXRQZXJzb24oZmllbGQsIGV2ZW50LnRhcmdldC52YWx1ZSwgdGhpcy5wcm9wcy5pZHgpO1xuICAgIH0sXG4gICAgaGFuZGxlRGVsZXRlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIFBlcnNvbkFjdGlvbnMuZGVsZXRlUGVyc29uKHRoaXMucHJvcHMuaWR4LCBldmVudCk7XG4gICAgfSxcbiAgICBzZXROYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnBlcnNvbi5uYW1lO1xuICAgIH0sXG4gICAgc2V0UGFpZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5wZXJzb24ucGFpZDtcbiAgICB9LFxuICAgIGtleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDkpIHtcbiAgICAgICAgICAgIFBlcnNvbkFjdGlvbnMuYWRkUGVyc29uKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGVsZXRlQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0ICYmIHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTEnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSBidG4tc20gYnRuLXJlbW92ZScgb25DbGljaz17dGhpcy5oYW5kbGVEZWxldGV9IHRhYkluZGV4PSctMSc+PGkgY2xhc3NOYW1lPSdmYSBmYS1taW51cyc+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgIG5hbWVDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAncGVyc29uX19uYW1lJzogdHJ1ZSxcbiAgICAgICAgICAgICdjb2wteHMtNCc6IHRydWUsXG4gICAgICAgICAgICAnaGFzLWVycm9yJzogIXRoaXMuc3RhdGUudmFsaWRhdGlvbi5wZXJzb25zW3RoaXMucHJvcHMuaWR4XS5uYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBwYWlkQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ2lucHV0LWdyb3VwJzogdHJ1ZSxcbiAgICAgICAgICAgICdoYXMtZXJyb3InOiAhdGhpcy5zdGF0ZS52YWxpZGF0aW9uLnBlcnNvbnNbdGhpcy5wcm9wcy5pZHhdLnBhaWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwZXJzb25MaXN0X19wZXJzb24gY2xlYXJmaXgnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtuYW1lQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9J0pvaG4gRG9lJyB2YWx1ZT17dGhpcy5zZXROYW1lKCl9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsICduYW1lJyl9IGF1dG9Gb2N1cyAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwZXJzb25fX3BhaWQgY29sLXhzLTYnPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17cGFpZENsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J3RlbCcgY2xhc3NOYW1lPSdmb3JtLWNvbnRyb2wgaW5wdXQtbGcnIHBsYWNlaG9sZGVyPScwJyB2YWx1ZT17dGhpcy5zZXRQYWlkKCl9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsICdwYWlkJyl9IG9uS2V5RG93bj17dGhpcy5rZXlEb3dufSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnB1dC1ncm91cC1hZGRvblwiPnt0aGlzLnN0YXRlLnNldHRpbmdzLmN1cnJlbmN5fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7ZGVsZXRlQnV0dG9uKCl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyksXG4gICAgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4JyksXG4gICAgUGVyc29uID0gcmVxdWlyZSgnLi9wZXJzb24uanN4JyksXG4gICAgUGVyc29uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcGVyc29uc3RvcmUuanMnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnYnJvd3Nlci1yZXF1ZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIG1peGluczogW1JlZmx1eC5jb25uZWN0KFBlcnNvblN0b3JlLCAncGVyc29ucycpXSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBlcnNvbnMgPSAnJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGVyc29ucy5wZXJzb25MaXN0KSB7XG4gICAgICAgICAgICBwZXJzb25zID0gdGhpcy5zdGF0ZS5wZXJzb25zLnBlcnNvbkxpc3QubWFwKGZ1bmN0aW9uIChwZXJzb24sIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8UGVyc29uIGtleT17aX0gaWR4PXtpfSBwZXJzb249e3BlcnNvbn0gLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybSBpZD0ncGVyc29uTGlzdCc+XG4gICAgICAgICAgICAgICAge3BlcnNvbnN9XG4gICAgICAgICAgICAgICAgPGRpdiBpZD0naGVscCc+UHJvdGlwOiB5b3UgY2FuIGVudGVyIG11bHRpcGxlIGFtb3VudHMgZm9yIHBlcnNvbiBieSBzZXBhcmF0aW5nIHRoZW0gYnkgc3BhY2UhPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBTZXR0aW5nQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2V0dGluZ2FjdGlvbnMuanMnKSxcbiAgICBTZXR0aW5nU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc2V0dGluZ3N0b3JlLmpzJyksXG4gICAgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbUmVmbHV4LmNvbm5lY3QoU2V0dGluZ1N0b3JlLCAnc2V0dGluZ3MnKV0sXG4gICAgc2V0Q3VycmVuY3k6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBTZXR0aW5nQWN0aW9ucy5zZXRDdXJyZW5jeShldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnZm9ybS1ob3Jpem9udGFsJzogdHJ1ZSxcbiAgICAgICAgICAgICdjb2wteHMtMTInOiB0cnVlLFxuICAgICAgICAgICAgJ2hpZGRlbic6ICF0aGlzLnN0YXRlLnNldHRpbmdzLnZpc2libGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtIGlkPSdzZXR0aW5ncycgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZm9ybS1ncm91cCc+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPSdjdXJyZW5jeSc+Q3VycmVuY3k8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGlkPSdjdXJyZW5jeScgY2xhc3NOYW1lPSdmb3JtLWNvbnRyb2wgaW5wdXQtbGcnIG9uQ2hhbmdlPXt0aGlzLnNldEN1cnJlbmN5fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J0VVUic+RVVSPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdVU0QnPlVTRDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsInZhciBzb3J0QnkgPSByZXF1aXJlKCdsb2Rhc2guc29ydGJ5JyksXG4gICAgZWFjaCA9IHJlcXVpcmUoJ2xvZGFzaC5mb3JlYWNoJyksXG4gICAgcmVkdWNlID0gcmVxdWlyZSgnbG9kYXNoLnJlZHVjZScpLFxuICAgIGZpbmQgPSByZXF1aXJlKCdsb2Rhc2guZmluZCcpLFxuICAgIHJlbW92ZSA9IHJlcXVpcmUoJ2xvZGFzaC5yZW1vdmUnKTtcblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5fSBBcnJheSBvZiBvYmplY3Qgd2l0aCBrZXlzIG5hbWUgYW5kIHBhaWQuXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHBheW1lbnQgZGV0YWlscy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBzb3J0ZWQsIHRvdGFsLCBzaGFyZSwgcGF5bWVudHM7XG5cbiAgICAvLyBSZW1vdmUgaW52YWxpZCBwZXJzb25zLlxuICAgIHJlbW92ZShkYXRhLCBmdW5jdGlvbiAocGVyc29uKSB7XG4gICAgICAgIHJldHVybiAhcGVyc29uLm5hbWUgfHwgcGVyc29uLm5hbWUubGVuZ3RoID09PSAwO1xuICAgIH0pO1xuXG4gICAgLy8gU29ydCBkYXRhIGJ5IHBhaWQgYW1vdW50IGFuZCB0aGVuIHJldmVyc2UuXG4gICAgc29ydGVkID0gc29ydEJ5KGRhdGEsICdwYWlkJykucmV2ZXJzZSgpO1xuXG4gICAgLy8gQWRkIElEIGZvciBlYWNoIHBlcnNvbi5cbiAgICBlYWNoKHNvcnRlZCwgZnVuY3Rpb24gKHBlcnNvbiwgaWR4KSB7XG4gICAgICAgIHBlcnNvbi5pZCA9IGlkeDtcbiAgICAgICAgcGVyc29uLnBhaWQgPSBNYXRoLnJvdW5kKE51bWJlcihwZXJzb24ucGFpZCAqIDEwMCkpO1xuICAgIH0pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRvdGFsIGFtb3VudC5cbiAgICB0b3RhbCA9IHJlZHVjZShzb3J0ZWQsIGZ1bmN0aW9uICh0b3RhbCwgcGVyc29uKSB7XG4gICAgICAgIHJldHVybiB0b3RhbCArIHBlcnNvbi5wYWlkO1xuICAgIH0sIDApO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHNoYXJlIHBlciBwZXJzb24uXG4gICAgc2hhcmUgPSBzb3J0ZWQubGVuZ3RoID4gMCA/IE1hdGgucm91bmQoTnVtYmVyKHRvdGFsIC8gc29ydGVkLmxlbmd0aCkpIDogMDtcblxuICAgIC8vIE9iamVjdCBmb3Igc3RvcmluZyByZXN1bHRzLlxuICAgIHBheW1lbnRzID0ge307XG5cbiAgICAvLyBMb29wIHRocm91Z2ggcGVyc29ucy5cbiAgICBlYWNoKHNvcnRlZCwgZnVuY3Rpb24gKHBlcnNvbikge1xuICAgICAgICAvLyBDYWxjYXVsYXRlIGhvdyBtdWNoIHBlcnNvbiBzdGlsbCBoYXMgdG8gcGF5IChvciByZWNlaXZlLCBpZiB0aGUgYW1vdW50IGlzIG5lZ2F0aXZlKS5cbiAgICAgICAgcGVyc29uLmxlZnQgPSBNYXRoLnJvdW5kKHNoYXJlIC0gcGVyc29uLnBhaWQpO1xuXG4gICAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgICAgLy8gTG9vcCB1bnRpbCBwZXJzb24gaGFzIHBhaWQgZW5vdWdoLlxuICAgICAgICB3aGlsZSAocGVyc29uLmxlZnQgPiAwKSB7XG4gICAgICAgICAgICBwYXltZW50c1twZXJzb24uaWRdID0gcGF5bWVudHNbcGVyc29uLmlkXSB8fCB7bmFtZTogcGVyc29uLm5hbWUsIHRvOiBbXX07XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IHBlcnNvbiB3aG8gaXMgdG8gcmVjZWl2ZSBtb25leS5cbiAgICAgICAgICAgIHRhcmdldCA9IGZpbmQoc29ydGVkLCBmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwLmxlZnQgPCAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFBheW1lbnQgcmVjZWl2ZXIgZm91bmQuXG4gICAgICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgLyogQ2hlY2sgaWYgcGF5aW5nIHBlcnNvbiBoYXMgbW9yZSBtb25leSB0aGFuIHJlY2VpdmVyLlxuICAgICAgICAgICAgICAgICAqIElmIHBheWluZyBoYXMgbW9yZSB0aGFuIHJlY2VpdmVyLCB0aGUgYW1vdW50IHRvIHBheSBlcXVhbHMgdGhlIGFtb3VudCByZWNlaXZlciBpcyB0byBnZXQuXG4gICAgICAgICAgICAgICAgICogSWYgcGF5aW5nIGhhcyBsZXNzIHRoYW4gcmVjZWl2ZXIsIHRoZSBhbW91bnQgdG8gcGF5IGlzIHJlc3Qgb2YgcGF5ZXJzIGRlYnQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdmFyIGFtb3VudCA9IE1hdGguYWJzKHRhcmdldC5sZWZ0KSA+IHBlcnNvbi5sZWZ0ID8gcGVyc29uLmxlZnQgOiBNYXRoLmFicyh0YXJnZXQubGVmdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgdG8gcmVjZWl2ZXIsIHN1YnRyYWN0IGZyb20gcGF5ZXIuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmxlZnQgKz0gYW1vdW50O1xuICAgICAgICAgICAgICAgIHBlcnNvbi5sZWZ0IC09IGFtb3VudDtcblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggZGV0YWlscyBmb3IgcmV0dXJuaW5nLlxuICAgICAgICAgICAgICAgIHBheW1lbnRzW3BlcnNvbi5pZF0udG8ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB0YXJnZXQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50OiBOdW1iZXIoYW1vdW50IC8gMTAwKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDb3VsZCBub3QgZmluZCBhbnkgcGVyc29uIHdobyBzdGlsbCBzaG91ZCByZWNlaXZlIG1vbmV5LlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIHRvdGFsIHdvbid0IGRpdmlkZSBlcXVhbGx5LlxuICAgICAgICAgICAgICAgIHBlcnNvbi5sZWZ0ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIHBheW1lbnRzIGFuZCBvdGhlciBkZXRhaWxzLlxuICAgIHJldHVybiB7cGF5bWVudHM6IHBheW1lbnRzLCB0b3RhbDogTnVtYmVyKHRvdGFsIC8gMTAwKSwgc2hhcmU6IE51bWJlcihzaGFyZSAvIDEwMCl9O1xufTtcbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBQZXJzb25BY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9wZXJzb25hY3Rpb25zLmpzJyksXG4gICAgRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBlcnNvbkxpc3Q6IFtdLFxuICAgICAgICAgICAgcGF5bWVudHM6IHt9LFxuICAgICAgICAgICAgdG90YWw6IDAsXG4gICAgICAgICAgICBzaGFyZTogMFxuICAgICAgICB9XG4gICAgfSxcbiAgICBQZXJzb25TdG9yZSA9IFJlZmx1eC5jcmVhdGVTdG9yZSh7XG4gICAgICAgIGxpc3RlbmFibGVzOiBbUGVyc29uQWN0aW9uc10sXG4gICAgICAgIHBlcnNvbnM6IG5ldyBEYXRhKCksXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUGVyc29uKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGVyc29ucztcbiAgICAgICAgfSxcbiAgICAgICAgYWRkUGVyc29uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNvbnMucGVyc29uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcGFpZDogdW5kZWZpbmVkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgICAgICB9LFxuICAgICAgICBlZGl0UGVyc29uOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlLCBpZHgpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc29ucy5wZXJzb25MaXN0W2lkeF1bZmllbGRdID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5wZXJzb25zLnBlcnNvbkxpc3RbaWR4XS5wcmlzdGluZSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlcnNvbnMucGVyc29uTGlzdFtpZHhdLnByaXN0aW5lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVBlcnNvbjogZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgdGhpcy5wZXJzb25zLnBlcnNvbkxpc3Quc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5wZXJzb25zKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2hhcmVUb3RhbDogZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc29ucy5wYXltZW50cyA9IHJlc3VsdHMucGF5bWVudHM7XG4gICAgICAgICAgICB0aGlzLnBlcnNvbnMudG90YWwgPSByZXN1bHRzLnRvdGFsO1xuICAgICAgICAgICAgdGhpcy5wZXJzb25zLnNoYXJlID0gcmVzdWx0cy5zaGFyZTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRQZXJzb25zOiBmdW5jdGlvbiAocGVyc29ucykge1xuICAgICAgICAgICAgdGhpcy5wZXJzb25zLnBlcnNvbkxpc3QgPSBwZXJzb25zO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucGVyc29ucyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNvbnMgPSBuZXcgRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRQZXJzb24oKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnBlcnNvbnMpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uU3RvcmU7XG4iLCJ2YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4JyksXG4gICAgU2V0dGluZ0FjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3NldHRpbmdhY3Rpb25zLmpzJyksXG4gICAgU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnRVVSJyxcbiAgICAgICAgICAgIGJpZDogdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFNldHRpbmdTdG9yZSA9IFJlZmx1eC5jcmVhdGVTdG9yZSh7XG4gICAgICAgIGxpc3RlbmFibGVzOiBbU2V0dGluZ0FjdGlvbnNdLFxuICAgICAgICBzZXR0aW5nczogbmV3IFNldHRpbmdzKCksXG4gICAgICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3M7XG4gICAgICAgIH0sXG4gICAgICAgIHRvZ2dsZVZpc2liaWxpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MudmlzaWJsZSA9ICF0aGlzLnNldHRpbmdzLnZpc2libGU7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIodGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEN1cnJlbmN5OiBmdW5jdGlvbiAoY3VycmVuY3kpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuY3VycmVuY3kgPSBjdXJyZW5jeTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0QmlkOiBmdW5jdGlvbiAoYmlkKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLmJpZCA9IGJpZDtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdTdG9yZTtcbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKSxcbiAgICBWYWxpZGF0ZUFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3ZhbGlkYXRlYWN0aW9ucy5qcycpLFxuICAgIFBlcnNvblN0b3JlID0gcmVxdWlyZSgnLi9wZXJzb25zdG9yZS5qcycpLFxuICAgIFZhbGlkYXRlU3RvcmUgPSBSZWZsdXguY3JlYXRlU3RvcmUoe1xuICAgICAgICBsaXN0ZW5hYmxlczogW1ZhbGlkYXRlQWN0aW9uc10sXG4gICAgICAgIHJlc3VsdHM6IHtcbiAgICAgICAgICAgIHBlcnNvbnM6IFtdLFxuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8oUGVyc29uU3RvcmUsIHRoaXMudmFsaWRhdGVGb3JtLCB0aGlzLnZhbGlkYXRlSW5pdGlhbEZvcm0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHM7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlSW5pdGlhbEZvcm06IGZ1bmN0aW9uIChwZXJzb25zKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMucGVyc29ucyA9IHRoaXMucGFyc2VQZXJzb25zKHBlcnNvbnMsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKHRoaXMucmVzdWx0cyk7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlRm9ybTogZnVuY3Rpb24gKHBlcnNvbnMpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cy5wZXJzb25zID0gdGhpcy5wYXJzZVBlcnNvbnMocGVyc29ucywgZmFsc2UpO1xuXG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMudmFsaWQgPSB0aGlzLnJlc3VsdHMucGVyc29ucy5ldmVyeShmdW5jdGlvbiAocGVyc29uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBlcnNvbi5uYW1lID09PSB0cnVlICYmIHBlcnNvbi5wYWlkID09PSB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcih0aGlzLnJlc3VsdHMpO1xuICAgICAgICB9LFxuICAgICAgICBwYXJzZVBlcnNvbnM6IGZ1bmN0aW9uIChwZXJzb25zLCBpbml0aWFsKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVyc29ucy5wZXJzb25MaXN0Lm1hcChmdW5jdGlvbiAocGVyc29uLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzTmFtZVZhbGlkID0gaW5pdGlhbCxcbiAgICAgICAgICAgICAgICAgICAgaXNQYWlkVmFsaWQgPSBpbml0aWFsO1xuXG4gICAgICAgICAgICAgICAgaXNOYW1lVmFsaWQgPSB0eXBlb2YgcGVyc29uLm5hbWUgIT09ICd1bmRlZmluZWQnID8gcGVyc29uLm5hbWUubGVuZ3RoID4gMCA6ICdwcmlzdGluZSc7XG4gICAgICAgICAgICAgICAgaXNQYWlkVmFsaWQgPSB0eXBlb2YgcGVyc29uLnBhaWQgIT09ICd1bmRlZmluZWQnID8gcGVyc29uLnBhaWQubWF0Y2goL15bXFxkLC4gXSskLykgIT09IG51bGwgOiAncHJpc3RpbmUnO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaXNOYW1lVmFsaWQsXG4gICAgICAgICAgICAgICAgICAgIHBhaWQ6IGlzUGFpZFZhbGlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0ZVN0b3JlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsIi8qKlxuICogQSBtb2R1bGUgb2YgbWV0aG9kcyB0aGF0IHlvdSB3YW50IHRvIGluY2x1ZGUgaW4gYWxsIGFjdGlvbnMuXG4gKiBUaGlzIG1vZHVsZSBpcyBjb25zdW1lZCBieSBgY3JlYXRlQWN0aW9uYC5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuY3JlYXRlZFN0b3JlcyA9IFtdO1xuXG5leHBvcnRzLmNyZWF0ZWRBY3Rpb25zID0gW107XG5cbmV4cG9ydHMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgd2hpbGUgKGV4cG9ydHMuY3JlYXRlZFN0b3Jlcy5sZW5ndGgpIHtcbiAgICAgICAgZXhwb3J0cy5jcmVhdGVkU3RvcmVzLnBvcCgpO1xuICAgIH1cbiAgICB3aGlsZSAoZXhwb3J0cy5jcmVhdGVkQWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgZXhwb3J0cy5jcmVhdGVkQWN0aW9ucy5wb3AoKTtcbiAgICB9XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpLFxuICAgIG1ha2VyID0gcmVxdWlyZShcIi4vam9pbnNcIikuaW5zdGFuY2VKb2luQ3JlYXRvcjtcblxuLyoqXG4gKiBFeHRyYWN0IGNoaWxkIGxpc3RlbmFibGVzIGZyb20gYSBwYXJlbnQgZnJvbSB0aGVpclxuICogY2hpbGRyZW4gcHJvcGVydHkgYW5kIHJldHVybiB0aGVtIGluIGEga2V5ZWQgT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGUgVGhlIHBhcmVudCBsaXN0ZW5hYmxlXG4gKi9cbnZhciBtYXBDaGlsZExpc3RlbmFibGVzID0gZnVuY3Rpb24gbWFwQ2hpbGRMaXN0ZW5hYmxlcyhsaXN0ZW5hYmxlKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBjaGlsZHJlbiA9IHt9LFxuICAgICAgICBjaGlsZE5hbWU7XG4gICAgZm9yICg7IGkgPCAobGlzdGVuYWJsZS5jaGlsZHJlbiB8fCBbXSkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY2hpbGROYW1lID0gbGlzdGVuYWJsZS5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGxpc3RlbmFibGVbY2hpbGROYW1lXSkge1xuICAgICAgICAgICAgY2hpbGRyZW5bY2hpbGROYW1lXSA9IGxpc3RlbmFibGVbY2hpbGROYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG59O1xuXG4vKipcbiAqIE1ha2UgYSBmbGF0IGRpY3Rpb25hcnkgb2YgYWxsIGxpc3RlbmFibGVzIGluY2x1ZGluZyB0aGVpclxuICogcG9zc2libGUgY2hpbGRyZW4gKHJlY3Vyc2l2ZWx5KSwgY29uY2F0ZW5hdGluZyBuYW1lcyBpbiBjYW1lbENhc2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGVzIFRoZSB0b3AtbGV2ZWwgbGlzdGVuYWJsZXNcbiAqL1xudmFyIGZsYXR0ZW5MaXN0ZW5hYmxlcyA9IGZ1bmN0aW9uIGZsYXR0ZW5MaXN0ZW5hYmxlcyhsaXN0ZW5hYmxlcykge1xuICAgIHZhciBmbGF0dGVuZWQgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbGlzdGVuYWJsZXMpIHtcbiAgICAgICAgdmFyIGxpc3RlbmFibGUgPSBsaXN0ZW5hYmxlc1trZXldO1xuICAgICAgICB2YXIgY2hpbGRNYXAgPSBtYXBDaGlsZExpc3RlbmFibGVzKGxpc3RlbmFibGUpO1xuXG4gICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGZsYXR0ZW4gY2hpbGRyZW5cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gZmxhdHRlbkxpc3RlbmFibGVzKGNoaWxkTWFwKTtcblxuICAgICAgICAvLyBhZGQgdGhlIHByaW1hcnkgbGlzdGVuYWJsZSBhbmQgY2hpbHJlblxuICAgICAgICBmbGF0dGVuZWRba2V5XSA9IGxpc3RlbmFibGU7XG4gICAgICAgIGZvciAodmFyIGNoaWxkS2V5IGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRMaXN0ZW5hYmxlID0gY2hpbGRyZW5bY2hpbGRLZXldO1xuICAgICAgICAgICAgZmxhdHRlbmVkW2tleSArIF8uY2FwaXRhbGl6ZShjaGlsZEtleSldID0gY2hpbGRMaXN0ZW5hYmxlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsYXR0ZW5lZDtcbn07XG5cbi8qKlxuICogQSBtb2R1bGUgb2YgbWV0aG9kcyByZWxhdGVkIHRvIGxpc3RlbmluZy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlcm5hbCB1dGlsaXR5IGZ1bmN0aW9uIHVzZWQgYnkgYHZhbGlkYXRlTGlzdGVuaW5nYFxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgVGhlIGxpc3RlbmFibGUgd2Ugd2FudCB0byBzZWFyY2ggZm9yXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IFRoZSByZXN1bHQgb2YgYSByZWN1cnNpdmUgc2VhcmNoIGFtb25nIGB0aGlzLnN1YnNjcmlwdGlvbnNgXG4gICAgICovXG4gICAgaGFzTGlzdGVuZXI6IGZ1bmN0aW9uIGhhc0xpc3RlbmVyKGxpc3RlbmFibGUpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGxpc3RlbmVyLFxuICAgICAgICAgICAgbGlzdGVuYWJsZXM7XG4gICAgICAgIGZvciAoOyBpIDwgKHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXSkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxpc3RlbmFibGVzID0gW10uY29uY2F0KHRoaXMuc3Vic2NyaXB0aW9uc1tpXS5saXN0ZW5hYmxlKTtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsaXN0ZW5hYmxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gbGlzdGVuYWJsZXNbal07XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyID09PSBsaXN0ZW5hYmxlIHx8IGxpc3RlbmVyLmhhc0xpc3RlbmVyICYmIGxpc3RlbmVyLmhhc0xpc3RlbmVyKGxpc3RlbmFibGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEEgY29udmVuaWVuY2UgbWV0aG9kIHRoYXQgbGlzdGVucyB0byBhbGwgbGlzdGVuYWJsZXMgaW4gdGhlIGdpdmVuIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5hYmxlcyBBbiBvYmplY3Qgb2YgbGlzdGVuYWJsZXMuIEtleXMgd2lsbCBiZSB1c2VkIGFzIGNhbGxiYWNrIG1ldGhvZCBuYW1lcy5cbiAgICAgKi9cbiAgICBsaXN0ZW5Ub01hbnk6IGZ1bmN0aW9uIGxpc3RlblRvTWFueShsaXN0ZW5hYmxlcykge1xuICAgICAgICB2YXIgYWxsTGlzdGVuYWJsZXMgPSBmbGF0dGVuTGlzdGVuYWJsZXMobGlzdGVuYWJsZXMpO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYWxsTGlzdGVuYWJsZXMpIHtcbiAgICAgICAgICAgIHZhciBjYm5hbWUgPSBfLmNhbGxiYWNrTmFtZShrZXkpLFxuICAgICAgICAgICAgICAgIGxvY2FsbmFtZSA9IHRoaXNbY2JuYW1lXSA/IGNibmFtZSA6IHRoaXNba2V5XSA/IGtleSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChsb2NhbG5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RlblRvKGFsbExpc3RlbmFibGVzW2tleV0sIGxvY2FsbmFtZSwgdGhpc1tjYm5hbWUgKyBcIkRlZmF1bHRcIl0gfHwgdGhpc1tsb2NhbG5hbWUgKyBcIkRlZmF1bHRcIl0gfHwgbG9jYWxuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgY29udGV4dCBjYW4gbGlzdGVuIHRvIHRoZSBzdXBwbGllZCBsaXN0ZW5hYmxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBBbiBBY3Rpb24gb3IgU3RvcmUgdGhhdCBzaG91bGQgYmVcbiAgICAgKiAgbGlzdGVuZWQgdG8uXG4gICAgICogQHJldHVybnMge1N0cmluZ3xVbmRlZmluZWR9IEFuIGVycm9yIG1lc3NhZ2UsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSB3YXMgbm8gcHJvYmxlbS5cbiAgICAgKi9cbiAgICB2YWxpZGF0ZUxpc3RlbmluZzogZnVuY3Rpb24gdmFsaWRhdGVMaXN0ZW5pbmcobGlzdGVuYWJsZSkge1xuICAgICAgICBpZiAobGlzdGVuYWJsZSA9PT0gdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIFwiTGlzdGVuZXIgaXMgbm90IGFibGUgdG8gbGlzdGVuIHRvIGl0c2VsZlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGxpc3RlbmFibGUubGlzdGVuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmFibGUgKyBcIiBpcyBtaXNzaW5nIGEgbGlzdGVuIG1ldGhvZFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5hYmxlLmhhc0xpc3RlbmVyICYmIGxpc3RlbmFibGUuaGFzTGlzdGVuZXIodGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkxpc3RlbmVyIGNhbm5vdCBsaXN0ZW4gdG8gdGhpcyBsaXN0ZW5hYmxlIGJlY2F1c2Ugb2YgY2lyY3VsYXIgbG9vcFwiO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBzdWJzY3JpcHRpb24gdG8gdGhlIGdpdmVuIGxpc3RlbmFibGUgZm9yIHRoZSBjb250ZXh0IG9iamVjdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gICAgICogIGxpc3RlbmVkIHRvLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGRlZmF1bHQgaGFuZGxlclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyB0aGUgb2JqZWN0IGJlaW5nIGxpc3RlbmVkIHRvXG4gICAgICovXG4gICAgbGlzdGVuVG86IGZ1bmN0aW9uIGxpc3RlblRvKGxpc3RlbmFibGUsIGNhbGxiYWNrLCBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlc3ViLFxuICAgICAgICAgICAgdW5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgc3Vic2NyaXB0aW9ub2JqLFxuICAgICAgICAgICAgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucyA9IHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgXy50aHJvd0lmKHRoaXMudmFsaWRhdGVMaXN0ZW5pbmcobGlzdGVuYWJsZSkpO1xuICAgICAgICB0aGlzLmZldGNoSW5pdGlhbFN0YXRlKGxpc3RlbmFibGUsIGRlZmF1bHRDYWxsYmFjayk7XG4gICAgICAgIGRlc3ViID0gbGlzdGVuYWJsZS5saXN0ZW4odGhpc1tjYWxsYmFja10gfHwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICB1bnN1YnNjcmliZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBzdWJzLmluZGV4T2Yoc3Vic2NyaXB0aW9ub2JqKTtcbiAgICAgICAgICAgIF8udGhyb3dJZihpbmRleCA9PT0gLTEsIFwiVHJpZWQgdG8gcmVtb3ZlIGxpc3RlbiBhbHJlYWR5IGdvbmUgZnJvbSBzdWJzY3JpcHRpb25zIGxpc3QhXCIpO1xuICAgICAgICAgICAgc3Vicy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgZGVzdWIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3Vic2NyaXB0aW9ub2JqID0ge1xuICAgICAgICAgICAgc3RvcDogdW5zdWJzY3JpYmVyLFxuICAgICAgICAgICAgbGlzdGVuYWJsZTogbGlzdGVuYWJsZVxuICAgICAgICB9O1xuICAgICAgICBzdWJzLnB1c2goc3Vic2NyaXB0aW9ub2JqKTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbm9iajtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgbGlzdGVuaW5nIHRvIGEgc2luZ2xlIGxpc3RlbmFibGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIFRoZSBhY3Rpb24gb3Igc3RvcmUgd2Ugbm8gbG9uZ2VyIHdhbnQgdG8gbGlzdGVuIHRvXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgYSBzdWJzY3JpcHRpb24gd2FzIGZvdW5kIGFuZCByZW1vdmVkLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG4gICAgc3RvcExpc3RlbmluZ1RvOiBmdW5jdGlvbiBzdG9wTGlzdGVuaW5nVG8obGlzdGVuYWJsZSkge1xuICAgICAgICB2YXIgc3ViLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBzdWJzID0gdGhpcy5zdWJzY3JpcHRpb25zIHx8IFtdO1xuICAgICAgICBmb3IgKDsgaSA8IHN1YnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN1YiA9IHN1YnNbaV07XG4gICAgICAgICAgICBpZiAoc3ViLmxpc3RlbmFibGUgPT09IGxpc3RlbmFibGUpIHtcbiAgICAgICAgICAgICAgICBzdWIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIF8udGhyb3dJZihzdWJzLmluZGV4T2Yoc3ViKSAhPT0gLTEsIFwiRmFpbGVkIHRvIHJlbW92ZSBsaXN0ZW4gZnJvbSBzdWJzY3JpcHRpb25zIGxpc3QhXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYWxsIHN1YnNjcmlwdGlvbnMgYW5kIGVtcHRpZXMgc3Vic2NyaXB0aW9ucyBhcnJheVxuICAgICAqL1xuICAgIHN0b3BMaXN0ZW5pbmdUb0FsbDogZnVuY3Rpb24gc3RvcExpc3RlbmluZ1RvQWxsKCkge1xuICAgICAgICB2YXIgcmVtYWluaW5nLFxuICAgICAgICAgICAgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgd2hpbGUgKHJlbWFpbmluZyA9IHN1YnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdWJzWzBdLnN0b3AoKTtcbiAgICAgICAgICAgIF8udGhyb3dJZihzdWJzLmxlbmd0aCAhPT0gcmVtYWluaW5nIC0gMSwgXCJGYWlsZWQgdG8gcmVtb3ZlIGxpc3RlbiBmcm9tIHN1YnNjcmlwdGlvbnMgbGlzdCFcIik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXNlZCBpbiBgbGlzdGVuVG9gLiBGZXRjaGVzIGluaXRpYWwgZGF0YSBmcm9tIGEgcHVibGlzaGVyIGlmIGl0IGhhcyBhIGBnZXRJbml0aWFsU3RhdGVgIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBUaGUgcHVibGlzaGVyIHdlIHdhbnQgdG8gZ2V0IGluaXRpYWwgc3RhdGUgZnJvbVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIG1ldGhvZCB0byByZWNlaXZlIHRoZSBkYXRhXG4gICAgICovXG4gICAgZmV0Y2hJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGZldGNoSW5pdGlhbFN0YXRlKGxpc3RlbmFibGUsIGRlZmF1bHRDYWxsYmFjaykge1xuICAgICAgICBkZWZhdWx0Q2FsbGJhY2sgPSBkZWZhdWx0Q2FsbGJhY2sgJiYgdGhpc1tkZWZhdWx0Q2FsbGJhY2tdIHx8IGRlZmF1bHRDYWxsYmFjaztcbiAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihkZWZhdWx0Q2FsbGJhY2spICYmIF8uaXNGdW5jdGlvbihsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSkpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUoKTtcbiAgICAgICAgICAgIGlmIChkYXRhICYmIF8uaXNGdW5jdGlvbihkYXRhLnRoZW4pKSB7XG4gICAgICAgICAgICAgICAgZGF0YS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdENhbGxiYWNrLmFwcGx5KG1lLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0Q2FsbGJhY2suY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25jZSBhbGwgbGlzdGVuYWJsZXMgaGF2ZSB0cmlnZ2VyZWQgYXQgbGVhc3Qgb25jZS5cbiAgICAgKiBJdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgbGFzdCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHN1YnNjcmlwdGlvbiBvYmogd2hlcmUgYHN0b3BgIGlzIGFuIHVuc3ViIGZ1bmN0aW9uIGFuZCBgbGlzdGVuYWJsZWAgaXMgYW4gYXJyYXkgb2YgbGlzdGVuYWJsZXNcbiAgICAgKi9cbiAgICBqb2luVHJhaWxpbmc6IG1ha2VyKFwibGFzdFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAqIEl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSBmaXJzdCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHN1YnNjcmlwdGlvbiBvYmogd2hlcmUgYHN0b3BgIGlzIGFuIHVuc3ViIGZ1bmN0aW9uIGFuZCBgbGlzdGVuYWJsZWAgaXMgYW4gYXJyYXkgb2YgbGlzdGVuYWJsZXNcbiAgICAgKi9cbiAgICBqb2luTGVhZGluZzogbWFrZXIoXCJmaXJzdFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAqIEl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIGFsbCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHN1YnNjcmlwdGlvbiBvYmogd2hlcmUgYHN0b3BgIGlzIGFuIHVuc3ViIGZ1bmN0aW9uIGFuZCBgbGlzdGVuYWJsZWAgaXMgYW4gYXJyYXkgb2YgbGlzdGVuYWJsZXNcbiAgICAgKi9cbiAgICBqb2luQ29uY2F0OiBtYWtlcihcImFsbFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZC5cbiAgICAgKiBJZiBhIGNhbGxiYWNrIHRyaWdnZXJzIHR3aWNlIGJlZm9yZSB0aGF0IGhhcHBlbnMsIGFuIGVycm9yIGlzIHRocm93bi5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHN1YnNjcmlwdGlvbiBvYmogd2hlcmUgYHN0b3BgIGlzIGFuIHVuc3ViIGZ1bmN0aW9uIGFuZCBgbGlzdGVuYWJsZWAgaXMgYW4gYXJyYXkgb2YgbGlzdGVuYWJsZXNcbiAgICAgKi9cbiAgICBqb2luU3RyaWN0OiBtYWtlcihcInN0cmljdFwiKVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcblxuLyoqXG4gKiBBIG1vZHVsZSBvZiBtZXRob2RzIGZvciBvYmplY3QgdGhhdCB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGxpc3RlbiB0by5cbiAqIFRoaXMgbW9kdWxlIGlzIGNvbnN1bWVkIGJ5IGBjcmVhdGVTdG9yZWAgYW5kIGBjcmVhdGVBY3Rpb25gXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogSG9vayB1c2VkIGJ5IHRoZSBwdWJsaXNoZXIgdGhhdCBpcyBpbnZva2VkIGJlZm9yZSBlbWl0dGluZ1xuICAgICAqIGFuZCBiZWZvcmUgYHNob3VsZEVtaXRgLiBUaGUgYXJndW1lbnRzIGFyZSB0aGUgb25lcyB0aGF0IHRoZSBhY3Rpb25cbiAgICAgKiBpcyBpbnZva2VkIHdpdGguIElmIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBzb21ldGhpbmcgb3RoZXIgdGhhblxuICAgICAqIHVuZGVmaW5lZCwgdGhhdCB3aWxsIGJlIHBhc3NlZCBvbiBhcyBhcmd1bWVudHMgZm9yIHNob3VsZEVtaXQgYW5kXG4gICAgICogZW1pc3Npb24uXG4gICAgICovXG4gICAgcHJlRW1pdDogZnVuY3Rpb24gcHJlRW1pdCgpIHt9LFxuXG4gICAgLyoqXG4gICAgICogSG9vayB1c2VkIGJ5IHRoZSBwdWJsaXNoZXIgYWZ0ZXIgYHByZUVtaXRgIHRvIGRldGVybWluZSBpZiB0aGVcbiAgICAgKiBldmVudCBzaG91bGQgYmUgZW1pdHRlZCB3aXRoIGdpdmVuIGFyZ3VtZW50cy4gVGhpcyBtYXkgYmUgb3ZlcnJpZGRlblxuICAgICAqIGluIHlvdXIgYXBwbGljYXRpb24sIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gYWx3YXlzIHJldHVybnMgdHJ1ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIGV2ZW50IHNob3VsZCBiZSBlbWl0dGVkXG4gICAgICovXG4gICAgc2hvdWxkRW1pdDogZnVuY3Rpb24gc2hvdWxkRW1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZXMgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBhY3Rpb24gdHJpZ2dlcmVkXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7TWl4ZWR9IFtvcHRpb25hbF0gYmluZENvbnRleHQgVGhlIGNvbnRleHQgdG8gYmluZCB0aGUgY2FsbGJhY2sgd2l0aFxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQ2FsbGJhY2sgdGhhdCB1bnN1YnNjcmliZXMgdGhlIHJlZ2lzdGVyZWQgZXZlbnQgaGFuZGxlclxuICAgICAqL1xuICAgIGxpc3RlbjogZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrLCBiaW5kQ29udGV4dCkge1xuICAgICAgICBiaW5kQ29udGV4dCA9IGJpbmRDb250ZXh0IHx8IHRoaXM7XG4gICAgICAgIHZhciBldmVudEhhbmRsZXIgPSBmdW5jdGlvbiBldmVudEhhbmRsZXIoYXJncykge1xuICAgICAgICAgICAgaWYgKGFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShiaW5kQ29udGV4dCwgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgICAgICBtZSA9IHRoaXMsXG4gICAgICAgICAgICBhYm9ydGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZW1pdHRlci5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50TGFiZWwsIGV2ZW50SGFuZGxlcik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIG1lLmVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobWUuZXZlbnRMYWJlbCwgZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGhhbmRsZXJzIHRvIHByb21pc2UgdGhhdCB0cmlnZ2VyIHRoZSBjb21wbGV0ZWQgYW5kIGZhaWxlZFxuICAgICAqIGNoaWxkIHB1Ymxpc2hlcnMsIGlmIGF2YWlsYWJsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUaGUgcHJvbWlzZSB0byBhdHRhY2ggdG9cbiAgICAgKi9cbiAgICBwcm9taXNlOiBmdW5jdGlvbiBwcm9taXNlKF9wcm9taXNlKSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGNhbkhhbmRsZVByb21pc2UgPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoXCJjb21wbGV0ZWRcIikgPj0gMCAmJiB0aGlzLmNoaWxkcmVuLmluZGV4T2YoXCJmYWlsZWRcIikgPj0gMDtcblxuICAgICAgICBpZiAoIWNhbkhhbmRsZVByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlB1Ymxpc2hlciBtdXN0IGhhdmUgXFxcImNvbXBsZXRlZFxcXCIgYW5kIFxcXCJmYWlsZWRcXFwiIGNoaWxkIHB1Ymxpc2hlcnNcIik7XG4gICAgICAgIH1cblxuICAgICAgICBfcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1lLmNvbXBsZXRlZChyZXNwb25zZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1lLmZhaWxlZChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYWN0aW9uIHRyaWdnZXJlZCwgd2hpY2ggc2hvdWxkXG4gICAgICogcmV0dXJuIGEgcHJvbWlzZSB0aGF0IGluIHR1cm4gaXMgcGFzc2VkIHRvIGB0aGlzLnByb21pc2VgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZXZlbnQgaGFuZGxlclxuICAgICAqL1xuICAgIGxpc3RlbkFuZFByb21pc2U6IGZ1bmN0aW9uIGxpc3RlbkFuZFByb21pc2UoY2FsbGJhY2ssIGJpbmRDb250ZXh0KSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIGJpbmRDb250ZXh0ID0gYmluZENvbnRleHQgfHwgdGhpcztcbiAgICAgICAgdGhpcy53aWxsQ2FsbFByb21pc2UgPSAodGhpcy53aWxsQ2FsbFByb21pc2UgfHwgMCkgKyAxO1xuXG4gICAgICAgIHZhciByZW1vdmVMaXN0ZW4gPSB0aGlzLmxpc3RlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBhIGZ1bmN0aW9uIHJldHVybmluZyBhIHByb21pc2UgYnV0IGdvdCBcIiArIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IGNhbGxiYWNrLmFwcGx5KGJpbmRDb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiBtZS5wcm9taXNlLmNhbGwobWUsIHByb21pc2UpO1xuICAgICAgICB9LCBiaW5kQ29udGV4dCk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1lLndpbGxDYWxsUHJvbWlzZS0tO1xuICAgICAgICAgICAgcmVtb3ZlTGlzdGVuLmNhbGwobWUpO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgYW4gZXZlbnQgdXNpbmcgYHRoaXMuZW1pdHRlcmAgKGlmIGBzaG91bGRFbWl0YCBhZ3JlZXMpXG4gICAgICovXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gdHJpZ2dlcigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBwcmUgPSB0aGlzLnByZUVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIGFyZ3MgPSBwcmUgPT09IHVuZGVmaW5lZCA/IGFyZ3MgOiBfLmlzQXJndW1lbnRzKHByZSkgPyBwcmUgOiBbXS5jb25jYXQocHJlKTtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkRW1pdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQodGhpcy5ldmVudExhYmVsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byBwdWJsaXNoIHRoZSBldmVudCBvbiB0aGUgbmV4dCB0aWNrXG4gICAgICovXG4gICAgdHJpZ2dlckFzeW5jOiBmdW5jdGlvbiB0cmlnZ2VyQXN5bmMoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgbWUgPSB0aGlzO1xuICAgICAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1lLnRyaWdnZXIuYXBwbHkobWUsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSB0cmlnZ2VyZWQgYWN0aW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAqICAgUmVzb2x2ZWQgYnkgY29tcGxldGVkIGNoaWxkIGFjdGlvbi5cbiAgICAgKiAgIFJlamVjdGVkIGJ5IGZhaWxlZCBjaGlsZCBhY3Rpb24uXG4gICAgICogICBJZiBsaXN0ZW5BbmRQcm9taXNlJ2QsIHRoZW4gcHJvbWlzZSBhc3NvY2lhdGVkIHRvIHRoaXMgdHJpZ2dlci5cbiAgICAgKiAgIE90aGVyd2lzZSwgdGhlIHByb21pc2UgaXMgZm9yIG5leHQgY2hpbGQgYWN0aW9uIGNvbXBsZXRpb24uXG4gICAgICovXG4gICAgdHJpZ2dlclByb21pc2U6IGZ1bmN0aW9uIHRyaWdnZXJQcm9taXNlKCkge1xuICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICB2YXIgY2FuSGFuZGxlUHJvbWlzZSA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihcImNvbXBsZXRlZFwiKSA+PSAwICYmIHRoaXMuY2hpbGRyZW4uaW5kZXhPZihcImZhaWxlZFwiKSA+PSAwO1xuXG4gICAgICAgIHZhciBwcm9taXNlID0gXy5jcmVhdGVQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIC8vIElmIGBsaXN0ZW5BbmRQcm9taXNlYCBpcyBsaXN0ZW5pbmdcbiAgICAgICAgICAgIC8vIHBhdGNoIGBwcm9taXNlYCB3LyBjb250ZXh0LWxvYWRlZCByZXNvbHZlL3JlamVjdFxuICAgICAgICAgICAgaWYgKG1lLndpbGxDYWxsUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIF8ubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNQcm9taXNlID0gbWUucHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgbWUucHJvbWlzZSA9IGZ1bmN0aW9uIChpbnB1dFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0UHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCYWNrIHRvIHlvdXIgcmVndWxhcmx5IHNjaGVkdWxlIHByb2dyYW1taW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgbWUucHJvbWlzZSA9IHByZXZpb3VzUHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZS5wcm9taXNlLmFwcGx5KG1lLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBtZS50cmlnZ2VyLmFwcGx5KG1lLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjYW5IYW5kbGVQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZVN1Y2Nlc3MgPSBtZS5jb21wbGV0ZWQubGlzdGVuKGZ1bmN0aW9uIChhcmdzQXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVN1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRmFpbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYXJnc0Fycik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlRmFpbGVkID0gbWUuZmFpbGVkLmxpc3RlbihmdW5jdGlvbiAoYXJnc0Fycikge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVTdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUZhaWxlZCgpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoYXJnc0Fycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1lLnRyaWdnZXJBc3luYy5hcHBseShtZSwgYXJncyk7XG5cbiAgICAgICAgICAgIGlmICghY2FuSGFuZGxlUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxufTsiLCIvKipcbiAqIEEgbW9kdWxlIG9mIG1ldGhvZHMgdGhhdCB5b3Ugd2FudCB0byBpbmNsdWRlIGluIGFsbCBzdG9yZXMuXG4gKiBUaGlzIG1vZHVsZSBpcyBjb25zdW1lZCBieSBgY3JlYXRlU3RvcmVgLlxuICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RvcmUsIGRlZmluaXRpb24pIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGRlZmluaXRpb24pIHtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZpbml0aW9uLCBuYW1lKTtcblxuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eURlc2NyaXB0b3IudmFsdWUgfHwgdHlwZW9mIHByb3BlcnR5RGVzY3JpcHRvci52YWx1ZSAhPT0gXCJmdW5jdGlvblwiIHx8ICFkZWZpbml0aW9uLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0b3JlW25hbWVdID0gZGVmaW5pdGlvbltuYW1lXS5iaW5kKHN0b3JlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IGRlZmluaXRpb25bbmFtZV07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgIT09IFwiZnVuY3Rpb25cIiB8fCAhZGVmaW5pdGlvbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdG9yZVtuYW1lXSA9IHByb3BlcnR5LmJpbmQoc3RvcmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0b3JlO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKSxcbiAgICBBY3Rpb25NZXRob2RzID0gcmVxdWlyZShcIi4vQWN0aW9uTWV0aG9kc1wiKSxcbiAgICBQdWJsaXNoZXJNZXRob2RzID0gcmVxdWlyZShcIi4vUHVibGlzaGVyTWV0aG9kc1wiKSxcbiAgICBLZWVwID0gcmVxdWlyZShcIi4vS2VlcFwiKTtcblxudmFyIGFsbG93ZWQgPSB7IHByZUVtaXQ6IDEsIHNob3VsZEVtaXQ6IDEgfTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFjdGlvbiBmdW5jdG9yIG9iamVjdC4gSXQgaXMgbWl4ZWQgaW4gd2l0aCBmdW5jdGlvbnNcbiAqIGZyb20gdGhlIGBQdWJsaXNoZXJNZXRob2RzYCBtaXhpbi4gYHByZUVtaXRgIGFuZCBgc2hvdWxkRW1pdGAgbWF5XG4gKiBiZSBvdmVycmlkZGVuIGluIHRoZSBkZWZpbml0aW9uIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvbiBUaGUgYWN0aW9uIG9iamVjdCBkZWZpbml0aW9uXG4gKi9cbnZhciBjcmVhdGVBY3Rpb24gPSBmdW5jdGlvbiBjcmVhdGVBY3Rpb24oZGVmaW5pdGlvbikge1xuXG4gICAgZGVmaW5pdGlvbiA9IGRlZmluaXRpb24gfHwge307XG4gICAgaWYgKCFfLmlzT2JqZWN0KGRlZmluaXRpb24pKSB7XG4gICAgICAgIGRlZmluaXRpb24gPSB7IGFjdGlvbk5hbWU6IGRlZmluaXRpb24gfTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBhIGluIEFjdGlvbk1ldGhvZHMpIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2FdICYmIFB1Ymxpc2hlck1ldGhvZHNbYV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgYSArIFwiIGluIFJlZmx1eC5BY3Rpb25NZXRob2RzLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGQgaW4gZGVmaW5pdGlvbikge1xuICAgICAgICBpZiAoIWFsbG93ZWRbZF0gJiYgUHVibGlzaGVyTWV0aG9kc1tkXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG92ZXJyaWRlIEFQSSBtZXRob2QgXCIgKyBkICsgXCIgaW4gYWN0aW9uIGNyZWF0aW9uLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlZmluaXRpb24uY2hpbGRyZW4gPSBkZWZpbml0aW9uLmNoaWxkcmVuIHx8IFtdO1xuICAgIGlmIChkZWZpbml0aW9uLmFzeW5jUmVzdWx0KSB7XG4gICAgICAgIGRlZmluaXRpb24uY2hpbGRyZW4gPSBkZWZpbml0aW9uLmNoaWxkcmVuLmNvbmNhdChbXCJjb21wbGV0ZWRcIiwgXCJmYWlsZWRcIl0pO1xuICAgIH1cblxuICAgIHZhciBpID0gMCxcbiAgICAgICAgY2hpbGRBY3Rpb25zID0ge307XG4gICAgZm9yICg7IGkgPCBkZWZpbml0aW9uLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuYW1lID0gZGVmaW5pdGlvbi5jaGlsZHJlbltpXTtcbiAgICAgICAgY2hpbGRBY3Rpb25zW25hbWVdID0gY3JlYXRlQWN0aW9uKG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBjb250ZXh0ID0gXy5leHRlbmQoe1xuICAgICAgICBldmVudExhYmVsOiBcImFjdGlvblwiLFxuICAgICAgICBlbWl0dGVyOiBuZXcgXy5FdmVudEVtaXR0ZXIoKSxcbiAgICAgICAgX2lzQWN0aW9uOiB0cnVlXG4gICAgfSwgUHVibGlzaGVyTWV0aG9kcywgQWN0aW9uTWV0aG9kcywgZGVmaW5pdGlvbik7XG5cbiAgICB2YXIgZnVuY3RvciA9IGZ1bmN0aW9uIGZ1bmN0b3IoKSB7XG4gICAgICAgIHZhciB0cmlnZ2VyVHlwZSA9IGZ1bmN0b3Iuc3luYyA/IFwidHJpZ2dlclwiIDogXy5lbnZpcm9ubWVudC5oYXNQcm9taXNlID8gXCJ0cmlnZ2VyUHJvbWlzZVwiIDogXCJ0cmlnZ2VyQXN5bmNcIjtcbiAgICAgICAgcmV0dXJuIGZ1bmN0b3JbdHJpZ2dlclR5cGVdLmFwcGx5KGZ1bmN0b3IsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIF8uZXh0ZW5kKGZ1bmN0b3IsIGNoaWxkQWN0aW9ucywgY29udGV4dCk7XG5cbiAgICBLZWVwLmNyZWF0ZWRBY3Rpb25zLnB1c2goZnVuY3Rvcik7XG5cbiAgICByZXR1cm4gZnVuY3Rvcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQWN0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpLFxuICAgIEtlZXAgPSByZXF1aXJlKFwiLi9LZWVwXCIpLFxuICAgIG1peGVyID0gcmVxdWlyZShcIi4vbWl4ZXJcIiksXG4gICAgYmluZE1ldGhvZHMgPSByZXF1aXJlKFwiLi9iaW5kTWV0aG9kc1wiKTtcblxudmFyIGFsbG93ZWQgPSB7IHByZUVtaXQ6IDEsIHNob3VsZEVtaXQ6IDEgfTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGV2ZW50IGVtaXR0aW5nIERhdGEgU3RvcmUuIEl0IGlzIG1peGVkIGluIHdpdGggZnVuY3Rpb25zXG4gKiBmcm9tIHRoZSBgTGlzdGVuZXJNZXRob2RzYCBhbmQgYFB1Ymxpc2hlck1ldGhvZHNgIG1peGlucy4gYHByZUVtaXRgXG4gKiBhbmQgYHNob3VsZEVtaXRgIG1heSBiZSBvdmVycmlkZGVuIGluIHRoZSBkZWZpbml0aW9uIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvbiBUaGUgZGF0YSBzdG9yZSBvYmplY3QgZGVmaW5pdGlvblxuICogQHJldHVybnMge1N0b3JlfSBBIGRhdGEgc3RvcmUgaW5zdGFuY2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuXG4gICAgdmFyIFN0b3JlTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1N0b3JlTWV0aG9kc1wiKSxcbiAgICAgICAgUHVibGlzaGVyTWV0aG9kcyA9IHJlcXVpcmUoXCIuL1B1Ymxpc2hlck1ldGhvZHNcIiksXG4gICAgICAgIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0xpc3RlbmVyTWV0aG9kc1wiKTtcblxuICAgIGRlZmluaXRpb24gPSBkZWZpbml0aW9uIHx8IHt9O1xuXG4gICAgZm9yICh2YXIgYSBpbiBTdG9yZU1ldGhvZHMpIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkW2FdICYmIChQdWJsaXNoZXJNZXRob2RzW2FdIHx8IExpc3RlbmVyTWV0aG9kc1thXSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgYSArIFwiIGluIFJlZmx1eC5TdG9yZU1ldGhvZHMuIFVzZSBhbm90aGVyIG1ldGhvZCBuYW1lIG9yIG92ZXJyaWRlIGl0IG9uIFJlZmx1eC5QdWJsaXNoZXJNZXRob2RzIC8gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kcyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGQgaW4gZGVmaW5pdGlvbikge1xuICAgICAgICBpZiAoIWFsbG93ZWRbZF0gJiYgKFB1Ymxpc2hlck1ldGhvZHNbZF0gfHwgTGlzdGVuZXJNZXRob2RzW2RdKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG92ZXJyaWRlIEFQSSBtZXRob2QgXCIgKyBkICsgXCIgaW4gc3RvcmUgY3JlYXRpb24uIFVzZSBhbm90aGVyIG1ldGhvZCBuYW1lIG9yIG92ZXJyaWRlIGl0IG9uIFJlZmx1eC5QdWJsaXNoZXJNZXRob2RzIC8gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kcyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlZmluaXRpb24gPSBtaXhlcihkZWZpbml0aW9uKTtcblxuICAgIGZ1bmN0aW9uIFN0b3JlKCkge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBhcnI7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgXy5FdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgdGhpcy5ldmVudExhYmVsID0gXCJjaGFuZ2VcIjtcbiAgICAgICAgYmluZE1ldGhvZHModGhpcywgZGVmaW5pdGlvbik7XG4gICAgICAgIGlmICh0aGlzLmluaXQgJiYgXy5pc0Z1bmN0aW9uKHRoaXMuaW5pdCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmFibGVzKSB7XG4gICAgICAgICAgICBhcnIgPSBbXS5jb25jYXQodGhpcy5saXN0ZW5hYmxlcyk7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuVG9NYW55KGFycltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfLmV4dGVuZChTdG9yZS5wcm90b3R5cGUsIExpc3RlbmVyTWV0aG9kcywgUHVibGlzaGVyTWV0aG9kcywgU3RvcmVNZXRob2RzLCBkZWZpbml0aW9uKTtcblxuICAgIHZhciBzdG9yZSA9IG5ldyBTdG9yZSgpO1xuICAgIEtlZXAuY3JlYXRlZFN0b3Jlcy5wdXNoKHN0b3JlKTtcblxuICAgIHJldHVybiBzdG9yZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBSZWZsdXggPSB7XG4gICAgdmVyc2lvbjoge1xuICAgICAgICBcInJlZmx1eC1jb3JlXCI6IFwiMC4yLjFcIlxuICAgIH1cbn07XG5cblJlZmx1eC5BY3Rpb25NZXRob2RzID0gcmVxdWlyZShcIi4vQWN0aW9uTWV0aG9kc1wiKTtcblxuUmVmbHV4Lkxpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoXCIuL0xpc3RlbmVyTWV0aG9kc1wiKTtcblxuUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMgPSByZXF1aXJlKFwiLi9QdWJsaXNoZXJNZXRob2RzXCIpO1xuXG5SZWZsdXguU3RvcmVNZXRob2RzID0gcmVxdWlyZShcIi4vU3RvcmVNZXRob2RzXCIpO1xuXG5SZWZsdXguY3JlYXRlQWN0aW9uID0gcmVxdWlyZShcIi4vY3JlYXRlQWN0aW9uXCIpO1xuXG5SZWZsdXguY3JlYXRlU3RvcmUgPSByZXF1aXJlKFwiLi9jcmVhdGVTdG9yZVwiKTtcblxudmFyIG1ha2VyID0gcmVxdWlyZShcIi4vam9pbnNcIikuc3RhdGljSm9pbkNyZWF0b3I7XG5cblJlZmx1eC5qb2luVHJhaWxpbmcgPSBSZWZsdXguYWxsID0gbWFrZXIoXCJsYXN0XCIpOyAvLyBSZWZsdXguYWxsIGFsaWFzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cblJlZmx1eC5qb2luTGVhZGluZyA9IG1ha2VyKFwiZmlyc3RcIik7XG5cblJlZmx1eC5qb2luU3RyaWN0ID0gbWFrZXIoXCJzdHJpY3RcIik7XG5cblJlZmx1eC5qb2luQ29uY2F0ID0gbWFrZXIoXCJhbGxcIik7XG5cbnZhciBfID0gUmVmbHV4LnV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5cblJlZmx1eC5FdmVudEVtaXR0ZXIgPSBfLkV2ZW50RW1pdHRlcjtcblxuUmVmbHV4LlByb21pc2UgPSBfLlByb21pc2U7XG5cbi8qKlxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgc2V0IG9mIGFjdGlvbnNcbiAqXG4gKiBAcGFyYW0gZGVmaW5pdGlvbnMgdGhlIGRlZmluaXRpb25zIGZvciB0aGUgYWN0aW9ucyB0byBiZSBjcmVhdGVkXG4gKiBAcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhY3Rpb25zIG9mIGNvcnJlc3BvbmRpbmcgYWN0aW9uIG5hbWVzXG4gKi9cblJlZmx1eC5jcmVhdGVBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVkdWNlciA9IGZ1bmN0aW9uIHJlZHVjZXIoZGVmaW5pdGlvbnMsIGFjdGlvbnMpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoZGVmaW5pdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGFjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBkZWZpbml0aW9uc1thY3Rpb25OYW1lXTtcbiAgICAgICAgICAgIGFjdGlvbnNbYWN0aW9uTmFtZV0gPSBSZWZsdXguY3JlYXRlQWN0aW9uKHZhbCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGRlZmluaXRpb25zKSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0ge307XG4gICAgICAgIGlmIChkZWZpbml0aW9ucyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBkZWZpbml0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZHVjZXIodmFsLCBhY3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zW3ZhbF0gPSBSZWZsdXguY3JlYXRlQWN0aW9uKHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWR1Y2VyKGRlZmluaXRpb25zLCBhY3Rpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aW9ucztcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBldmVudG1pdHRlciB0aGF0IFJlZmx1eCB1c2VzXG4gKi9cblJlZmx1eC5zZXRFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoY3R4KSB7XG4gICAgUmVmbHV4LkV2ZW50RW1pdHRlciA9IF8uRXZlbnRFbWl0dGVyID0gY3R4O1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBQcm9taXNlIGxpYnJhcnkgdGhhdCBSZWZsdXggdXNlc1xuICovXG5SZWZsdXguc2V0UHJvbWlzZSA9IGZ1bmN0aW9uIChjdHgpIHtcbiAgICBSZWZsdXguUHJvbWlzZSA9IF8uUHJvbWlzZSA9IGN0eDtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgUHJvbWlzZSBmYWN0b3J5IHRoYXQgY3JlYXRlcyBuZXcgcHJvbWlzZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZhY3RvcnkgaGFzIHRoZSBzaWduYXR1cmUgYGZ1bmN0aW9uKHJlc29sdmVyKSB7IHJldHVybiBbbmV3IFByb21pc2VdOyB9YFxuICovXG5SZWZsdXguc2V0UHJvbWlzZUZhY3RvcnkgPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIF8uY3JlYXRlUHJvbWlzZSA9IGZhY3Rvcnk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIG1ldGhvZCB1c2VkIGZvciBkZWZlcnJpbmcgYWN0aW9ucyBhbmQgc3RvcmVzXG4gKi9cblJlZmx1eC5uZXh0VGljayA9IGZ1bmN0aW9uIChuZXh0VGljaykge1xuICAgIF8ubmV4dFRpY2sgPSBuZXh0VGljaztcbn07XG5cblJlZmx1eC51c2UgPSBmdW5jdGlvbiAocGx1Z2luQ2IpIHtcbiAgICBwbHVnaW5DYihSZWZsdXgpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgc2V0IG9mIGNyZWF0ZWQgYWN0aW9ucyBhbmQgc3RvcmVzIGZvciBpbnRyb3NwZWN0aW9uXG4gKi9cbi8qZXNsaW50LWRpc2FibGUgbm8tdW5kZXJzY29yZS1kYW5nbGUqL1xuUmVmbHV4Ll9fa2VlcCA9IHJlcXVpcmUoXCIuL0tlZXBcIik7XG4vKmVzbGludC1lbmFibGUgbm8tdW5kZXJzY29yZS1kYW5nbGUqL1xuXG4vKipcbiAqIFdhcm4gaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgbm90IGF2YWlsYWJsZVxuICovXG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIG5vdCBhdmFpbGFibGUuIFwiICsgXCJFUzUgc2hpbSByZXF1aXJlZC4gXCIgKyBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcG9pa2UvcmVmbHV4anMjZXM1XCIpO1xufVxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFJlZmx1eDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiLyoqXG4gKiBJbnRlcm5hbCBtb2R1bGUgdXNlZCB0byBjcmVhdGUgc3RhdGljIGFuZCBpbnN0YW5jZSBqb2luIG1ldGhvZHNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIi4vY3JlYXRlU3RvcmVcIiksXG4gICAgXyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgc3RyYXRlZ3lNZXRob2ROYW1lcyA9IHtcbiAgICBzdHJpY3Q6IFwiam9pblN0cmljdFwiLFxuICAgIGZpcnN0OiBcImpvaW5MZWFkaW5nXCIsXG4gICAgbGFzdDogXCJqb2luVHJhaWxpbmdcIixcbiAgICBhbGw6IFwiam9pbkNvbmNhdFwiXG59O1xuXG4vKipcbiAqIFVzZWQgaW4gYGluZGV4LmpzYCB0byBjcmVhdGUgdGhlIHN0YXRpYyBqb2luIG1ldGhvZHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJhdGVneSBXaGljaCBzdHJhdGVneSB0byB1c2Ugd2hlbiB0cmFja2luZyBsaXN0ZW5hYmxlIHRyaWdnZXIgYXJndW1lbnRzXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RhdGljIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBzdG9yZSB3aXRoIGEgam9pbiBsaXN0ZW4gb24gdGhlIGdpdmVuIGxpc3RlbmFibGVzIHVzaW5nIHRoZSBnaXZlbiBzdHJhdGVneVxuICovXG5leHBvcnRzLnN0YXRpY0pvaW5DcmVhdG9yID0gZnVuY3Rpb24gKHN0cmF0ZWd5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIC8qIGxpc3RlbmFibGVzLi4uICove1xuICAgICAgICB2YXIgbGlzdGVuYWJsZXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdG9yZSh7XG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgICAgIHRoaXNbc3RyYXRlZ3lNZXRob2ROYW1lc1tzdHJhdGVneV1dLmFwcGx5KHRoaXMsIGxpc3RlbmFibGVzLmNvbmNhdChcInRyaWdnZXJBc3luY1wiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFVzZWQgaW4gYExpc3RlbmVyTWV0aG9kcy5qc2AgdG8gY3JlYXRlIHRoZSBpbnN0YW5jZSBqb2luIG1ldGhvZHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJhdGVneSBXaGljaCBzdHJhdGVneSB0byB1c2Ugd2hlbiB0cmFja2luZyBsaXN0ZW5hYmxlIHRyaWdnZXIgYXJndW1lbnRzXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEFuIGluc3RhbmNlIG1ldGhvZCB3aGljaCBzZXRzIHVwIGEgam9pbiBsaXN0ZW4gb24gdGhlIGdpdmVuIGxpc3RlbmFibGVzIHVzaW5nIHRoZSBnaXZlbiBzdHJhdGVneVxuICovXG5leHBvcnRzLmluc3RhbmNlSm9pbkNyZWF0b3IgPSBmdW5jdGlvbiAoc3RyYXRlZ3kpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkgLyogbGlzdGVuYWJsZXMuLi4sIGNhbGxiYWNrKi97XG4gICAgICAgIF8udGhyb3dJZihhcmd1bWVudHMubGVuZ3RoIDwgMiwgXCJDYW5ub3QgY3JlYXRlIGEgam9pbiB3aXRoIGxlc3MgdGhhbiAyIGxpc3RlbmFibGVzIVwiKTtcbiAgICAgICAgdmFyIGxpc3RlbmFibGVzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSBsaXN0ZW5hYmxlcy5wb3AoKSxcbiAgICAgICAgICAgIG51bWJlck9mTGlzdGVuYWJsZXMgPSBsaXN0ZW5hYmxlcy5sZW5ndGgsXG4gICAgICAgICAgICBqb2luID0ge1xuICAgICAgICAgICAgbnVtYmVyT2ZMaXN0ZW5hYmxlczogbnVtYmVyT2ZMaXN0ZW5hYmxlcyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzW2NhbGxiYWNrXSB8fCBjYWxsYmFjayxcbiAgICAgICAgICAgIGxpc3RlbmVyOiB0aGlzLFxuICAgICAgICAgICAgc3RyYXRlZ3k6IHN0cmF0ZWd5XG4gICAgICAgIH0sXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgY2FuY2VscyA9IFtdLFxuICAgICAgICAgICAgc3Vib2JqO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZMaXN0ZW5hYmxlczsgaSsrKSB7XG4gICAgICAgICAgICBfLnRocm93SWYodGhpcy52YWxpZGF0ZUxpc3RlbmluZyhsaXN0ZW5hYmxlc1tpXSkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkxpc3RlbmFibGVzOyBpKyspIHtcbiAgICAgICAgICAgIGNhbmNlbHMucHVzaChsaXN0ZW5hYmxlc1tpXS5saXN0ZW4obmV3TGlzdGVuZXIoaSwgam9pbiksIHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXNldChqb2luKTtcbiAgICAgICAgc3Vib2JqID0geyBsaXN0ZW5hYmxlOiBsaXN0ZW5hYmxlcyB9O1xuICAgICAgICBzdWJvYmouc3RvcCA9IG1ha2VTdG9wcGVyKHN1Ym9iaiwgY2FuY2VscywgdGhpcyk7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9ICh0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW10pLmNvbmNhdChzdWJvYmopO1xuICAgICAgICByZXR1cm4gc3Vib2JqO1xuICAgIH07XG59O1xuXG4vLyAtLS0tIGludGVybmFsIGpvaW4gZnVuY3Rpb25zIC0tLS1cblxuZnVuY3Rpb24gbWFrZVN0b3BwZXIoc3Vib2JqLCBjYW5jZWxzLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBzdWJzID0gY29udGV4dC5zdWJzY3JpcHRpb25zLFxuICAgICAgICAgICAgaW5kZXggPSBzdWJzID8gc3Vicy5pbmRleE9mKHN1Ym9iaikgOiAtMTtcbiAgICAgICAgXy50aHJvd0lmKGluZGV4ID09PSAtMSwgXCJUcmllZCB0byByZW1vdmUgam9pbiBhbHJlYWR5IGdvbmUgZnJvbSBzdWJzY3JpcHRpb25zIGxpc3QhXCIpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2FuY2Vscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2FuY2Vsc1tpXSgpO1xuICAgICAgICB9XG4gICAgICAgIHN1YnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiByZXNldChqb2luKSB7XG4gICAgam9pbi5saXN0ZW5hYmxlc0VtaXR0ZWQgPSBuZXcgQXJyYXkoam9pbi5udW1iZXJPZkxpc3RlbmFibGVzKTtcbiAgICBqb2luLmFyZ3MgPSBuZXcgQXJyYXkoam9pbi5udW1iZXJPZkxpc3RlbmFibGVzKTtcbn1cblxuZnVuY3Rpb24gbmV3TGlzdGVuZXIoaSwgam9pbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjYWxsYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKGpvaW4ubGlzdGVuYWJsZXNFbWl0dGVkW2ldKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGpvaW4uc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RyaWN0XCI6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0cmljdCBqb2luIGZhaWxlZCBiZWNhdXNlIGxpc3RlbmVyIHRyaWdnZXJlZCB0d2ljZS5cIik7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxhc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgam9pbi5hcmdzW2ldID0gY2FsbGFyZ3M7YnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImFsbFwiOlxuICAgICAgICAgICAgICAgICAgICBqb2luLmFyZ3NbaV0ucHVzaChjYWxsYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqb2luLmxpc3RlbmFibGVzRW1pdHRlZFtpXSA9IHRydWU7XG4gICAgICAgICAgICBqb2luLmFyZ3NbaV0gPSBqb2luLnN0cmF0ZWd5ID09PSBcImFsbFwiID8gW2NhbGxhcmdzXSA6IGNhbGxhcmdzO1xuICAgICAgICB9XG4gICAgICAgIGVtaXRJZkFsbExpc3RlbmFibGVzRW1pdHRlZChqb2luKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBlbWl0SWZBbGxMaXN0ZW5hYmxlc0VtaXR0ZWQoam9pbikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgam9pbi5udW1iZXJPZkxpc3RlbmFibGVzOyBpKyspIHtcbiAgICAgICAgaWYgKCFqb2luLmxpc3RlbmFibGVzRW1pdHRlZFtpXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGpvaW4uY2FsbGJhY2suYXBwbHkoam9pbi5saXN0ZW5lciwgam9pbi5hcmdzKTtcbiAgICByZXNldChqb2luKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtaXgoZGVmKSB7XG4gICAgdmFyIGNvbXBvc2VkID0ge1xuICAgICAgICBpbml0OiBbXSxcbiAgICAgICAgcHJlRW1pdDogW10sXG4gICAgICAgIHNob3VsZEVtaXQ6IFtdXG4gICAgfTtcblxuICAgIHZhciB1cGRhdGVkID0gKGZ1bmN0aW9uIG1peERlZihtaXhpbikge1xuICAgICAgICB2YXIgbWl4ZWQgPSB7fTtcbiAgICAgICAgaWYgKG1peGluLm1peGlucykge1xuICAgICAgICAgICAgbWl4aW4ubWl4aW5zLmZvckVhY2goZnVuY3Rpb24gKHN1Yk1peGluKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQobWl4ZWQsIG1peERlZihzdWJNaXhpbikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXy5leHRlbmQobWl4ZWQsIG1peGluKTtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9zZWQpLmZvckVhY2goZnVuY3Rpb24gKGNvbXBvc2FibGUpIHtcbiAgICAgICAgICAgIGlmIChtaXhpbi5oYXNPd25Qcm9wZXJ0eShjb21wb3NhYmxlKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvc2VkW2NvbXBvc2FibGVdLnB1c2gobWl4aW5bY29tcG9zYWJsZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1peGVkO1xuICAgIH0pKGRlZik7XG5cbiAgICBpZiAoY29tcG9zZWQuaW5pdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHVwZGF0ZWQuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgY29tcG9zZWQuaW5pdC5mb3JFYWNoKGZ1bmN0aW9uIChpbml0KSB7XG4gICAgICAgICAgICAgICAgaW5pdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoY29tcG9zZWQucHJlRW1pdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHVwZGF0ZWQucHJlRW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb3NlZC5wcmVFbWl0LnJlZHVjZSgoZnVuY3Rpb24gKGFyZ3MsIHByZUVtaXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSBwcmVFbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkID8gYXJncyA6IFtuZXdWYWx1ZV07XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoY29tcG9zZWQuc2hvdWxkRW1pdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHVwZGF0ZWQuc2hvdWxkRW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuICFjb21wb3NlZC5zaG91bGRFbWl0LnNvbWUoZnVuY3Rpb24gKHNob3VsZEVtaXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXNob3VsZEVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXMoY29tcG9zZWQpLmZvckVhY2goZnVuY3Rpb24gKGNvbXBvc2FibGUpIHtcbiAgICAgICAgaWYgKGNvbXBvc2VkW2NvbXBvc2FibGVdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdXBkYXRlZFtjb21wb3NhYmxlXSA9IGNvbXBvc2VkW2NvbXBvc2FibGVdWzBdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXBkYXRlZDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY2FwaXRhbGl6ZSA9IGNhcGl0YWxpemU7XG5leHBvcnRzLmNhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTmFtZTtcbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcbmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbmV4cG9ydHMub2JqZWN0ID0gb2JqZWN0O1xuZXhwb3J0cy5pc0FyZ3VtZW50cyA9IGlzQXJndW1lbnRzO1xuZXhwb3J0cy50aHJvd0lmID0gdGhyb3dJZjtcblxuZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xufVxuXG5mdW5jdGlvbiBjYWxsYmFja05hbWUoc3RyaW5nLCBwcmVmaXgpIHtcbiAgICBwcmVmaXggPSBwcmVmaXggfHwgXCJvblwiO1xuICAgIHJldHVybiBwcmVmaXggKyBleHBvcnRzLmNhcGl0YWxpemUoc3RyaW5nKTtcbn1cblxudmFyIGVudmlyb25tZW50ID0ge307XG5cbmV4cG9ydHMuZW52aXJvbm1lbnQgPSBlbnZpcm9ubWVudDtcbmZ1bmN0aW9uIGNoZWNrRW52KHRhcmdldCkge1xuICAgIHZhciBmbGFnID0gdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICAgIC8qZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgICAgICBpZiAoZXZhbCh0YXJnZXQpKSB7XG4gICAgICAgICAgICBmbGFnID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvKmVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgIH1cbiAgICBlbnZpcm9ubWVudFtjYWxsYmFja05hbWUodGFyZ2V0LCBcImhhc1wiKV0gPSBmbGFnO1xufVxuY2hlY2tFbnYoXCJzZXRJbW1lZGlhdGVcIik7XG5jaGVja0VudihcIlByb21pc2VcIik7XG5cbi8qXG4gKiBpc09iamVjdCwgZXh0ZW5kLCBpc0Z1bmN0aW9uLCBpc0FyZ3VtZW50cyBhcmUgdGFrZW4gZnJvbSB1bmRlc2NvcmUvbG9kYXNoIGluXG4gKiBvcmRlciB0byByZW1vdmUgdGhlIGRlcGVuZGVuY3lcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlID09PSBcIm9iamVjdFwiICYmICEhb2JqO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqKSB7XG4gICAgaWYgKCFpc09iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIHZhciBzb3VyY2UsIHByb3A7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgcHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbmV4cG9ydHMuRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50ZW1pdHRlcjNcIik7XG5cbmlmIChlbnZpcm9ubWVudC5oYXNTZXRJbW1lZGlhdGUpIHtcbiAgICBleHBvcnRzLm5leHRUaWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHNldEltbWVkaWF0ZShjYWxsYmFjayk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgZXhwb3J0cy5uZXh0VGljayA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBvYmplY3Qoa2V5cywgdmFscykge1xuICAgIHZhciBvID0ge30sXG4gICAgICAgIGkgPSAwO1xuICAgIGZvciAoOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvW2tleXNbaV1dID0gdmFsc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIG87XG59XG5cbmlmIChlbnZpcm9ubWVudC5oYXNQcm9taXNlKSB7XG4gICAgZXhwb3J0cy5Qcm9taXNlID0gUHJvbWlzZTtcbiAgICBleHBvcnRzLmNyZWF0ZVByb21pc2UgPSBmdW5jdGlvbiAocmVzb2x2ZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBleHBvcnRzLlByb21pc2UocmVzb2x2ZXIpO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGV4cG9ydHMuUHJvbWlzZSA9IG51bGw7XG4gICAgZXhwb3J0cy5jcmVhdGVQcm9taXNlID0gZnVuY3Rpb24gKCkge307XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBcImNhbGxlZVwiIGluIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09IFwibnVtYmVyXCI7XG59XG5cbmZ1bmN0aW9uIHRocm93SWYodmFsLCBtc2cpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICAgIHRocm93IEVycm9yKG1zZyB8fCB2YWwpO1xuICAgIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi91dGlscycpLFxuICAgIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi9MaXN0ZW5lck1ldGhvZHMnKTtcblxuLyoqXG4gKiBBIG1vZHVsZSBtZWFudCB0byBiZSBjb25zdW1lZCBhcyBhIG1peGluIGJ5IGEgUmVhY3QgY29tcG9uZW50LiBTdXBwbGllcyB0aGUgbWV0aG9kcyBmcm9tXG4gKiBgTGlzdGVuZXJNZXRob2RzYCBtaXhpbiBhbmQgdGFrZXMgY2FyZSBvZiB0ZWFyZG93biBvZiBzdWJzY3JpcHRpb25zLlxuICogTm90ZSB0aGF0IGlmIHlvdSdyZSB1c2luZyB0aGUgYGNvbm5lY3RgIG1peGluIHlvdSBkb24ndCBuZWVkIHRoaXMgbWl4aW4sIGFzIGNvbm5lY3Qgd2lsbFxuICogaW1wb3J0IGV2ZXJ5dGhpbmcgdGhpcyBtaXhpbiBjb250YWlucyFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfLmV4dGVuZCh7XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgKi9cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogTGlzdGVuZXJNZXRob2RzLnN0b3BMaXN0ZW5pbmdUb0FsbFxuXG59LCBMaXN0ZW5lck1ldGhvZHMpO1xuIiwidmFyIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi9MaXN0ZW5lck1ldGhvZHMnKSxcbiAgICBMaXN0ZW5lck1peGluID0gcmVxdWlyZSgnLi9MaXN0ZW5lck1peGluJyksXG4gICAgXyA9IHJlcXVpcmUoJ3JlZmx1eC1jb3JlL2xpYi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3RlbmFibGUsa2V5KXtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmFibGUuZ2V0SW5pdGlhbFN0YXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm9iamVjdChba2V5XSxbbGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUoKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMsTGlzdGVuZXJNZXRob2RzKTtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXMsIGNiID0gKGtleSA9PT0gdW5kZWZpbmVkID8gdGhpcy5zZXRTdGF0ZSA6IGZ1bmN0aW9uKHYpe1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWUuaXNNb3VudGVkID09PSBcInVuZGVmaW5lZFwiIHx8IG1lLmlzTW91bnRlZCgpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lLnNldFN0YXRlKF8ub2JqZWN0KFtrZXldLFt2XSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5UbyhsaXN0ZW5hYmxlLGNiKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQ6IExpc3RlbmVyTWl4aW4uY29tcG9uZW50V2lsbFVubW91bnRcbiAgICB9O1xufTtcbiIsInZhciBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzJyksXG4gICAgTGlzdGVuZXJNaXhpbiA9IHJlcXVpcmUoJy4vTGlzdGVuZXJNaXhpbicpLFxuICAgIF8gPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0ZW5hYmxlLCBrZXksIGZpbHRlckZ1bmMpIHtcbiAgICBmaWx0ZXJGdW5jID0gXy5pc0Z1bmN0aW9uKGtleSkgPyBrZXkgOiBmaWx0ZXJGdW5jO1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlckZ1bmMuY2FsbCh0aGlzLCBsaXN0ZW5hYmxlLmdldEluaXRpYWxTdGF0ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIGluaXRpYWwgcGF5bG9hZCBmcm9tIHN0b3JlLlxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmaWx0ZXJGdW5jLmNhbGwodGhpcywgbGlzdGVuYWJsZS5nZXRJbml0aWFsU3RhdGUoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihyZXN1bHQpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLm9iamVjdChba2V5XSwgW3Jlc3VsdF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF8uZXh0ZW5kKHRoaXMsIExpc3RlbmVyTWV0aG9kcyk7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWUuc2V0U3RhdGUoZmlsdGVyRnVuYy5jYWxsKG1lLCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmaWx0ZXJGdW5jLmNhbGwobWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbWUuc2V0U3RhdGUoXy5vYmplY3QoW2tleV0sIFtyZXN1bHRdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5saXN0ZW5UbyhsaXN0ZW5hYmxlLCBjYik7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBMaXN0ZW5lck1peGluLmNvbXBvbmVudFdpbGxVbm1vdW50XG4gICAgfTtcbn07XG5cbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgtY29yZScpO1xuXG5SZWZsdXguY29ubmVjdCA9IHJlcXVpcmUoJy4vY29ubmVjdCcpO1xuXG5SZWZsdXguY29ubmVjdEZpbHRlciA9IHJlcXVpcmUoJy4vY29ubmVjdEZpbHRlcicpO1xuXG5SZWZsdXguTGlzdGVuZXJNaXhpbiA9IHJlcXVpcmUoJy4vTGlzdGVuZXJNaXhpbicpO1xuXG5SZWZsdXgubGlzdGVuVG8gPSByZXF1aXJlKCcuL2xpc3RlblRvJyk7XG5cblJlZmx1eC5saXN0ZW5Ub01hbnkgPSByZXF1aXJlKCcuL2xpc3RlblRvTWFueScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZmx1eDtcbiIsInZhciBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzJyk7XG5cbi8qKlxuICogQSBtaXhpbiBmYWN0b3J5IGZvciBhIFJlYWN0IGNvbXBvbmVudC4gTWVhbnQgYXMgYSBtb3JlIGNvbnZlbmllbnQgd2F5IG9mIHVzaW5nIHRoZSBgTGlzdGVuZXJNaXhpbmAsXG4gKiB3aXRob3V0IGhhdmluZyB0byBtYW51YWxseSBzZXQgbGlzdGVuZXJzIGluIHRoZSBgY29tcG9uZW50RGlkTW91bnRgIG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBBbiBBY3Rpb24gb3IgU3RvcmUgdGhhdCBzaG91bGQgYmVcbiAqICBsaXN0ZW5lZCB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZXZlbnQgaGFuZGxlclxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGRlZmF1bHRDYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZGVmYXVsdCBoYW5kbGVyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3QgdG8gYmUgdXNlZCBhcyBhIG1peGluLCB3aGljaCBzZXRzIHVwIHRoZSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGxpc3RlbmFibGUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZSxjYWxsYmFjayxpbml0aWFsKXtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHVwIHRoZSBtaXhpbiBiZWZvcmUgdGhlIGluaXRpYWwgcmVuZGVyaW5nIG9jY3Vycy4gSW1wb3J0IG1ldGhvZHMgZnJvbSBgTGlzdGVuZXJNZXRob2RzYFxuICAgICAgICAgKiBhbmQgdGhlbiBtYWtlIHRoZSBjYWxsIHRvIGBsaXN0ZW5Ub2Agd2l0aCB0aGUgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBmYWN0b3J5IGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3IodmFyIG0gaW4gTGlzdGVuZXJNZXRob2RzKXtcbiAgICAgICAgICAgICAgICBpZiAodGhpc1ttXSAhPT0gTGlzdGVuZXJNZXRob2RzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW4ndCBoYXZlIG90aGVyIHByb3BlcnR5ICdcIittK1wiJyB3aGVuIHVzaW5nIFJlZmx1eC5saXN0ZW5UbyFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzW21dID0gTGlzdGVuZXJNZXRob2RzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZSxjYWxsYmFjayxpbml0aWFsKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFucyB1cCBhbGwgbGlzdGVuZXIgcHJldmlvdXNseSByZWdpc3RlcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQ6IExpc3RlbmVyTWV0aG9kcy5zdG9wTGlzdGVuaW5nVG9BbGxcbiAgICB9O1xufTtcbiIsInZhciBMaXN0ZW5lck1ldGhvZHMgPSByZXF1aXJlKCdyZWZsdXgtY29yZS9saWIvTGlzdGVuZXJNZXRob2RzJyk7XG5cbi8qKlxuICogQSBtaXhpbiBmYWN0b3J5IGZvciBhIFJlYWN0IGNvbXBvbmVudC4gTWVhbnQgYXMgYSBtb3JlIGNvbnZlbmllbnQgd2F5IG9mIHVzaW5nIHRoZSBgbGlzdGVuZXJNaXhpbmAsXG4gKiB3aXRob3V0IGhhdmluZyB0byBtYW51YWxseSBzZXQgbGlzdGVuZXJzIGluIHRoZSBgY29tcG9uZW50RGlkTW91bnRgIG1ldGhvZC4gVGhpcyB2ZXJzaW9uIGlzIHVzZWRcbiAqIHRvIGF1dG9tYXRpY2FsbHkgc2V0IHVwIGEgYGxpc3RlblRvTWFueWAgY2FsbC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuYWJsZXMgQW4gb2JqZWN0IG9mIGxpc3RlbmFibGVzXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3QgdG8gYmUgdXNlZCBhcyBhIG1peGluLCB3aGljaCBzZXRzIHVwIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiBsaXN0ZW5hYmxlcy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0ZW5hYmxlcyl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB1cCB0aGUgbWl4aW4gYmVmb3JlIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvY2N1cnMuIEltcG9ydCBtZXRob2RzIGZyb20gYExpc3RlbmVyTWV0aG9kc2BcbiAgICAgICAgICogYW5kIHRoZW4gbWFrZSB0aGUgY2FsbCB0byBgbGlzdGVuVG9gIHdpdGggdGhlIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZmFjdG9yeSBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yKHZhciBtIGluIExpc3RlbmVyTWV0aG9kcyl7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0gIT09IExpc3RlbmVyTWV0aG9kc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2FuJ3QgaGF2ZSBvdGhlciBwcm9wZXJ0eSAnXCIrbStcIicgd2hlbiB1c2luZyBSZWZsdXgubGlzdGVuVG9NYW55IVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbV0gPSBMaXN0ZW5lck1ldGhvZHNbbV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5saXN0ZW5Ub01hbnkobGlzdGVuYWJsZXMpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xlYW5zIHVwIGFsbCBsaXN0ZW5lciBwcmV2aW91c2x5IHJlZ2lzdGVyZWQuXG4gICAgICAgICAqL1xuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudDogTGlzdGVuZXJNZXRob2RzLnN0b3BMaXN0ZW5pbmdUb0FsbFxuICAgIH07XG59O1xuIl19
