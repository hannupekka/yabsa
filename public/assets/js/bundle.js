(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./components/paymentwrapper.jsx":4,"react":"react","react-router":"react-router"}],2:[function(require,module,exports){
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

},{"react":"react","react-intl":"react-intl"}],3:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var Payment = require('./payment.jsx');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var _map = require('lodash.map');

module.exports = React.createClass({displayName: "exports",
    mixins: [IntlMixin],
    render: function() {
        var payments = _map(this.props.payments, function(payment, i) {
            var personsPayments = payment.to.map(function(p,j) {
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
            React.createElement("div", {id: "paymentList", className: "col-md-4"}, 
                React.createElement("div", {className: "stats"}, 
                    React.createElement("b", null, "Total: "), " ", React.createElement(FormattedNumber, {value: this.props.total, style: "currency", currency: this.props.currency}), " ", React.createElement("br", null), 
                    React.createElement("b", null, "Share: "), " ", React.createElement(FormattedNumber, {value: this.props.share, style: "currency", currency: this.props.currency}), " ", React.createElement("br", null)
                ), 
                payments
            )
        );
    }
});

},{"./payment.jsx":2,"lodash.map":"lodash.map","react":"react","react-intl":"react-intl"}],4:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');
var PersonList = require('./personlist.jsx');
var PaymentList = require('./paymentlist.jsx');
var Settings = require('./settings.jsx');
var Router = require('react-router');
var request = require('browser-request');
var shareBill = require('../functions.js');

module.exports = React.createClass({displayName: "exports",
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function() {
        return {payments: {}, total: 0, share: 0, currency: 'EUR', showSettings: false, bid: this.context.router.getCurrentParams().bid || false};
    },
    changeCurrency: function(currency) {
      this.setState({currency: currency});
    },
    toggleSettings: function() {
      this.setState({showSettings: !this.state.showSettings});
    },
    deleteBill: function() {
        var baseUrl = window.location.origin;
        request({url: baseUrl + '/api/v1/bill/' + this.state.bid, method: 'DELETE'}, function(error, response, body) {
            window.location = baseUrl;
        }.bind(this));
    },
    shareTotal: function(persons) {
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
        var results = shareBill(data);

        var baseUrl = window.location.origin;
        var router = this.context.router;
        var method = this.state.bid ? 'PUT' : 'POST';
        var url = this.state.bid ? '/bill/' + this.state.bid : '/bill';
        var bid = this.state.bid;

        request({url: baseUrl + '/api/v1' + url, method: method, body: {data: persons, currency: this.state.currency}, json: true}, function(error, response, body) {
            if (!this.state.bid) {
                bid = body.bid;
                router.transitionTo('bill', {bid: bid});
            }

            this.setState({payments: results.payments, total: results.total, share: results.share, bid: bid});
        }.bind(this));
    },
    render: function() {
        var router = this.context.router;
        return (
            React.createElement("div", null, 
                React.createElement(Settings, {onCurrencyChange: this.changeCurrency, currency: this.state.currency, showSettings: this.state.showSettings}), 
                React.createElement(PersonList, {onShareTotal: this.shareTotal, onCurrencyChange: this.changeCurrency, onDeleteBill: this.deleteBill, currency: this.state.currency, onToggleSettings: this.toggleSettings, bid: this.state.bid}), 
                React.createElement(PaymentList, {payments: this.state.payments, total: this.state.total, share: this.state.share, currency: this.state.currency})
            )
        );
    }
});

},{"../functions.js":8,"./paymentlist.jsx":3,"./personlist.jsx":6,"./settings.jsx":7,"browser-request":"browser-request","react":"react","react-router":"react-router"}],5:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({displayName: "exports",
    handleChange: function(field, event) {
        this.props.onPersonChange(field, event.target.value, this.props.idx);
    },
    setName: function() {
        return this.props.data.pristine ? undefined : this.props.data.name;
    },
    setPaid: function() {
        return this.props.data.pristine ? undefined : this.props.data.paid;
    },
    render: function() {
        var buttonClass = this.props.personCount === 1 ? 'hidden' : 'col-xs-1';
        return (
            React.createElement("div", {className: "personList__person clearfix"}, 
                React.createElement("div", {className: "person__name col-xs-4"}, 
                    React.createElement("input", {type: "text", className: "form-control input-lg", placeholder: this.props.data.name, value: this.setName(), onChange: this.handleChange.bind(this, 'name'), autoFocus: true})
                ), 
                React.createElement("div", {className: "person__paid col-xs-6"}, 
                    React.createElement("div", {className: "input-group"}, 
                        React.createElement("input", {type: "tel", className: "form-control input-lg", placeholder: this.props.data.paid, value: this.setPaid(), onChange: this.handleChange.bind(this, 'paid')}), 
                        React.createElement("div", {className: "input-group-addon"}, this.props.currency)
                    )
                ), 
                React.createElement("div", {className: buttonClass}, 
                    React.createElement("div", {className: "btn btn-primary btn-sm btn-remove", onClick: this.props.onDelete, tabIndex: "-1"}, React.createElement("i", {className: "fa fa-minus"}))
                )
            )
        );
    }
});

},{"react":"react"}],6:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react/addons');
var Person = require('./person.jsx');
var request = require('browser-request');

module.exports = React.createClass({displayName: "exports",
    componentDidMount: function() {
        var baseUrl = window.location.origin;
        if (this.props.bid) {
            request(baseUrl + '/api/v1/bill/' + this.props.bid, function(error, response, body) {
                var data = JSON.parse(body);
                this.setState({persons: data.data});
                this.props.onCurrencyChange(data.currency);
                this.shareTotal();
            }.bind(this));
        }
    },
    getInitialState: function() {
        var persons = this.props.bid ? [] : [{
            'name': 'John Doe',
            'paid': '0',
            'pristine': true
        }];
        var currency = this.props.bid ? this.props.currency : 'EUR';
        return {persons: persons, currency: currency};
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
        delete persons[idx].pristine;
        this.setState({persons: persons});
    },
    addPerson: function(event) {
        event.preventDefault();
        this.setState({persons: this.state.persons.concat([{name: 'John Doe', paid: '0', pristine: true}])});
    },
    shareTotal: function(event) {
        if (event) {
            event.preventDefault();
        }
        this.props.onShareTotal(this.state.persons);
    },
    toggleSettings: function(event) {
        event.preventDefault();
        this.props.onToggleSettings();
    },
    deleteBill: function(event) {
        event.preventDefault();
        this.props.onDeleteBill();
    },
    render: function() {
        var persons = this.state.persons.map(function(person, i) {
            return (
                React.createElement(Person, {key: i, idx: i, data: person, personCount: this.state.persons.length, onPersonChange: this.handleChange, onDelete: this.removePerson.bind(this, i), currency: this.props.currency, bid: this.props.bid})
            );
        }.bind(this));

        var deleteButton = function() {
            if (this.props.bid) {
                return (
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.deleteBill}, React.createElement("i", {className: "fa fa-trash-o"}), React.createElement("span", {className: "hidden-xs"}, " Delete"))
                );
            }
        }.bind(this);

        return (
            React.createElement("form", {id: "personList", className: "col-md-8"}, 
                persons, 
                React.createElement("div", {id: "help", className: "col-xs-12"}, "Protip: you can enter multiple amounts for person by separating them by space!"), 
                React.createElement("div", {id: "buttons", className: "col-xs-12"}, 
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.addPerson}, React.createElement("i", {className: "fa fa-user-plus"}), React.createElement("span", {className: "hidden-xs"}, " Add person")), 
                    React.createElement("button", {className: "btn btn-lg btn-primary settings", onClick: this.toggleSettings}, React.createElement("i", {className: "fa fa-cog"}), React.createElement("span", {className: "hidden-xs"}, " Settings")), 
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.shareTotal}, React.createElement("i", {className: "fa fa-calculator"}), React.createElement("span", {className: "hidden-xs"}, " Share total")), 
                    deleteButton()
                )
            )
        );
    }
});

},{"./person.jsx":5,"browser-request":"browser-request","react/addons":"react/addons"}],7:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({displayName: "exports",
    handleCurrencyChange: function(event) {
        this.props.onCurrencyChange(event.target.value);
    },
    render: function() {
        var settingsClassName = this.props.showSettings ? 'form-horizontal col-xs-12' : 'hidden';
        return (
            React.createElement("form", {id: "settings", className: settingsClassName}, 
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("label", {htmlFor: "currency"}, "Currency"), 
                    React.createElement("select", {id: "currency", className: "form-control input-lg", value: this.props.currency, onChange: this.handleCurrencyChange}, 
                        React.createElement("option", {value: "EUR"}, "EUR"), 
                        React.createElement("option", {value: "USD"}, "USD")
                    )
                )
            )
        );
    }
});

},{"react":"react"}],8:[function(require,module,exports){
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

},{"lodash.find":"lodash.find","lodash.foreach":"lodash.foreach","lodash.reduce":"lodash.reduce","lodash.remove":"lodash.remove","lodash.sortby":"lodash.sortby"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9hcHAuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3BheW1lbnQuanN4IiwiL3Zhci93d3cvZGV2L2JpbGxlci9zcmMvanMvY29tcG9uZW50cy9wYXltZW50bGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29uLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29ubGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3NldHRpbmdzLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2Z1bmN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUN6QixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQzs7QUFFaEUsSUFBSSxNQUFNO0lBQ04sb0JBQUMsS0FBSyxFQUFBLENBQUEsQ0FBQyxPQUFBLEVBQU8sQ0FBRSxjQUFnQixDQUFBLEVBQUE7UUFDNUIsb0JBQUMsS0FBSyxFQUFBLENBQUEsQ0FBQyxJQUFBLEVBQUksQ0FBQyxPQUFBLEVBQU8sQ0FBQyxJQUFBLEVBQUksQ0FBQyxHQUFBLEVBQUcsQ0FBQyxPQUFBLEVBQU8sQ0FBRSxjQUFlLENBQUUsQ0FB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LEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZHOztnQkFFZ0IsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7QUFDdEMsZ0JBQWdCLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDO0FBQ3RDOztnQkFFZ0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO29CQUN4QixFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUk7b0JBQ2YsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2lCQUMvQixDQUFDLENBQUM7QUFDbkIsYUFBYSxNQUFNO0FBQ25COztnQkFFZ0IsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7YUFDbkI7U0FDSjtBQUNULEtBQUssQ0FBQyxDQUFDO0FBQ1A7O0lBRUksT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN2RiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xudmFyIFJvdXRlID0gUm91dGVyLlJvdXRlO1xudmFyIFBheW1lbnRXcmFwcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCcpO1xuXG52YXIgcm91dGVzID0gKFxuICAgIDxSb3V0ZSBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiaW5kZXhcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiYmlsbFwiIHBhdGg9XCIvOmJpZFwiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgPC9Sb3V0ZT5cbik7XG5cblJvdXRlci5ydW4ocm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXBwZXInKSk7XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbSW50bE1peGluXSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X190cmFuc2FjdGlvbiBjbGVhcmZpeCBjb2wtbWQtMTInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMyBjb2wtbWQtNCB0cmFuc2FjdGlvbl9fYW1vdW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5wcm9wcy5hbW91bnR9IHN0eWxlPVwiY3VycmVuY3lcIiBjdXJyZW5jeT1cIkVVUlwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy05IGNvbC1tZC04Jz5cbiAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPSdmYSBmYS1sb25nLWFycm93LXJpZ2h0Jz48L2k+IHt0aGlzLnByb3BzLnRvfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFBheW1lbnQgPSByZXF1aXJlKCcuL3BheW1lbnQuanN4Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcbnZhciBfbWFwID0gcmVxdWlyZSgnbG9kYXNoLm1hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtJbnRsTWl4aW5dLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXltZW50cyA9IF9tYXAodGhpcy5wcm9wcy5wYXltZW50cywgZnVuY3Rpb24ocGF5bWVudCwgaSkge1xuICAgICAgICAgICAgdmFyIHBlcnNvbnNQYXltZW50cyA9IHBheW1lbnQudG8ubWFwKGZ1bmN0aW9uKHAsaikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxQYXltZW50IGtleT17an0gdG89e3AudG99IGFtb3VudD17cC5hbW91bnR9IC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9J3BheW1lbnRMaXN0X19wYXltZW50IGNsZWFyZml4Jz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X19mcm9tJz57cGF5bWVudC5uYW1lfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX3RyYW5zYWN0aW9ucyBjbGVhcmZpeCBiZy1wcmltYXJ5Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwZXJzb25zUGF5bWVudHN9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9J3BheW1lbnRMaXN0JyBjbGFzc05hbWU9J2NvbC1tZC00Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc3RhdHMnPlxuICAgICAgICAgICAgICAgICAgICA8Yj5Ub3RhbDogPC9iPiA8Rm9ybWF0dGVkTnVtYmVyIHZhbHVlPXt0aGlzLnByb3BzLnRvdGFsfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnByb3BzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGI+U2hhcmU6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5wcm9wcy5zaGFyZX0gc3R5bGU9J2N1cnJlbmN5JyBjdXJyZW5jeT17dGhpcy5wcm9wcy5jdXJyZW5jeX0gLz4gPGJyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3BheW1lbnRzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFBlcnNvbkxpc3QgPSByZXF1aXJlKCcuL3BlcnNvbmxpc3QuanN4Jyk7XG52YXIgUGF5bWVudExpc3QgPSByZXF1aXJlKCcuL3BheW1lbnRsaXN0LmpzeCcpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncy5qc3gnKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKCdyZWFjdC1yb3V0ZXInKTtcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnYnJvd3Nlci1yZXF1ZXN0Jyk7XG52YXIgc2hhcmVCaWxsID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge3BheW1lbnRzOiB7fSwgdG90YWw6IDAsIHNoYXJlOiAwLCBjdXJyZW5jeTogJ0VVUicsIHNob3dTZXR0aW5nczogZmFsc2UsIGJpZDogdGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkuYmlkIHx8IGZhbHNlfTtcbiAgICB9LFxuICAgIGNoYW5nZUN1cnJlbmN5OiBmdW5jdGlvbihjdXJyZW5jeSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7Y3VycmVuY3k6IGN1cnJlbmN5fSk7XG4gICAgfSxcbiAgICB0b2dnbGVTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG93U2V0dGluZ3M6ICF0aGlzLnN0YXRlLnNob3dTZXR0aW5nc30pO1xuICAgIH0sXG4gICAgZGVsZXRlQmlsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcbiAgICAgICAgcmVxdWVzdCh7dXJsOiBiYXNlVXJsICsgJy9hcGkvdjEvYmlsbC8nICsgdGhpcy5zdGF0ZS5iaWQsIG1ldGhvZDogJ0RFTEVURSd9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGJhc2VVcmw7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBzaGFyZVRvdGFsOiBmdW5jdGlvbihwZXJzb25zKSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIHBlcnNvbkNvdW50ID0gcGVyc29ucy5sZW5ndGg7XG4gICAgICAgIHZhciBwZXJzb247XG4gICAgICAgIHZhciBwYWlkO1xuICAgICAgICBmb3IgKDsgaSA8IHBlcnNvbkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHBlcnNvbiA9IHBlcnNvbnNbaV07XG4gICAgICAgICAgICAvLyBTdW0gYW1vdW50cyBpZiBtdWx0aXBsZSBnaXZlbi4gQWxzbyByZXBsYWNlIGNvbW1hcy5cbiAgICAgICAgICAgIHBhaWQgPSB0eXBlb2YgcGVyc29uLnBhaWQgPT09ICdzdHJpbmcnID8gcGVyc29uLnBhaWQuc3BsaXQoJyAnKS5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIocHJldikgKyBOdW1iZXIoY3VycmVudC5yZXBsYWNlKCcsJywgJy4nKSk7XG4gICAgICAgICAgICB9LCAwKSA6IHBlcnNvbi5wYWlkO1xuICAgICAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwZXJzb24ubmFtZSxcbiAgICAgICAgICAgICAgICBwYWlkOiBOdW1iZXIocGFpZClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHRzID0gc2hhcmVCaWxsKGRhdGEpO1xuXG4gICAgICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcbiAgICAgICAgdmFyIHJvdXRlciA9IHRoaXMuY29udGV4dC5yb3V0ZXI7XG4gICAgICAgIHZhciBtZXRob2QgPSB0aGlzLnN0YXRlLmJpZCA/ICdQVVQnIDogJ1BPU1QnO1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5zdGF0ZS5iaWQgPyAnL2JpbGwvJyArIHRoaXMuc3RhdGUuYmlkIDogJy9iaWxsJztcbiAgICAgICAgdmFyIGJpZCA9IHRoaXMuc3RhdGUuYmlkO1xuXG4gICAgICAgIHJlcXVlc3Qoe3VybDogYmFzZVVybCArICcvYXBpL3YxJyArIHVybCwgbWV0aG9kOiBtZXRob2QsIGJvZHk6IHtkYXRhOiBwZXJzb25zLCBjdXJyZW5jeTogdGhpcy5zdGF0ZS5jdXJyZW5jeX0sIGpzb246IHRydWV9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5iaWQpIHtcbiAgICAgICAgICAgICAgICBiaWQgPSBib2R5LmJpZDtcbiAgICAgICAgICAgICAgICByb3V0ZXIudHJhbnNpdGlvblRvKCdiaWxsJywge2JpZDogYmlkfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3BheW1lbnRzOiByZXN1bHRzLnBheW1lbnRzLCB0b3RhbDogcmVzdWx0cy50b3RhbCwgc2hhcmU6IHJlc3VsdHMuc2hhcmUsIGJpZDogYmlkfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcm91dGVyID0gdGhpcy5jb250ZXh0LnJvdXRlcjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPFNldHRpbmdzIG9uQ3VycmVuY3lDaGFuZ2U9e3RoaXMuY2hhbmdlQ3VycmVuY3l9IGN1cnJlbmN5PXt0aGlzLnN0YXRlLmN1cnJlbmN5fSBzaG93U2V0dGluZ3M9e3RoaXMuc3RhdGUuc2hvd1NldHRpbmdzfSAvPlxuICAgICAgICAgICAgICAgIDxQZXJzb25MaXN0IG9uU2hhcmVUb3RhbD17dGhpcy5zaGFyZVRvdGFsfSBvbkN1cnJlbmN5Q2hhbmdlPXt0aGlzLmNoYW5nZUN1cnJlbmN5fSBvbkRlbGV0ZUJpbGw9e3RoaXMuZGVsZXRlQmlsbH0gY3VycmVuY3k9e3RoaXMuc3RhdGUuY3VycmVuY3l9IG9uVG9nZ2xlU2V0dGluZ3M9e3RoaXMudG9nZ2xlU2V0dGluZ3N9IGJpZD17dGhpcy5zdGF0ZS5iaWR9IC8+XG4gICAgICAgICAgICAgICAgPFBheW1lbnRMaXN0IHBheW1lbnRzPXt0aGlzLnN0YXRlLnBheW1lbnRzfSB0b3RhbD17dGhpcy5zdGF0ZS50b3RhbH0gc2hhcmU9e3RoaXMuc3RhdGUuc2hhcmV9IGN1cnJlbmN5PXt0aGlzLnN0YXRlLmN1cnJlbmN5fSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGZpZWxkLCBldmVudCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGVyc29uQ2hhbmdlKGZpZWxkLCBldmVudC50YXJnZXQudmFsdWUsIHRoaXMucHJvcHMuaWR4KTtcbiAgICB9LFxuICAgIHNldE5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kYXRhLnByaXN0aW5lID8gdW5kZWZpbmVkIDogdGhpcy5wcm9wcy5kYXRhLm5hbWU7XG4gICAgfSxcbiAgICBzZXRQYWlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGF0YS5wcmlzdGluZSA/IHVuZGVmaW5lZCA6IHRoaXMucHJvcHMuZGF0YS5wYWlkO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJ1dHRvbkNsYXNzID0gdGhpcy5wcm9wcy5wZXJzb25Db3VudCA9PT0gMSA/ICdoaWRkZW4nIDogJ2NvbC14cy0xJztcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwZXJzb25MaXN0X19wZXJzb24gY2xlYXJmaXgnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwZXJzb25fX25hbWUgY29sLXhzLTQnPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGV4dCcgY2xhc3NOYW1lPSdmb3JtLWNvbnRyb2wgaW5wdXQtbGcnIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLmRhdGEubmFtZX0gdmFsdWU9e3RoaXMuc2V0TmFtZSgpfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCAnbmFtZScpfSBhdXRvRm9jdXMgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGVyc29uX19wYWlkIGNvbC14cy02Jz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2lucHV0LWdyb3VwJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZWwnIGNsYXNzTmFtZT0nZm9ybS1jb250cm9sIGlucHV0LWxnJyBwbGFjZWhvbGRlcj17dGhpcy5wcm9wcy5kYXRhLnBhaWR9IHZhbHVlPXt0aGlzLnNldFBhaWQoKX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3BhaWQnKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj57dGhpcy5wcm9wcy5jdXJyZW5jeX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2J1dHRvbkNsYXNzfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSBidG4tc20gYnRuLXJlbW92ZScgb25DbGljaz17dGhpcy5wcm9wcy5vbkRlbGV0ZX0gdGFiSW5kZXg9Jy0xJz48aSBjbGFzc05hbWU9J2ZhIGZhLW1pbnVzJz48L2k+PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUGVyc29uID0gcmVxdWlyZSgnLi9wZXJzb24uanN4Jyk7XG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ2Jyb3dzZXItcmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmlkKSB7XG4gICAgICAgICAgICByZXF1ZXN0KGJhc2VVcmwgKyAnL2FwaS92MS9iaWxsLycgKyB0aGlzLnByb3BzLmJpZCwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3BlcnNvbnM6IGRhdGEuZGF0YX0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DdXJyZW5jeUNoYW5nZShkYXRhLmN1cnJlbmN5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYXJlVG90YWwoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwZXJzb25zID0gdGhpcy5wcm9wcy5iaWQgPyBbXSA6IFt7XG4gICAgICAgICAgICAnbmFtZSc6ICdKb2huIERvZScsXG4gICAgICAgICAgICAncGFpZCc6ICcwJyxcbiAgICAgICAgICAgICdwcmlzdGluZSc6IHRydWVcbiAgICAgICAgfV07XG4gICAgICAgIHZhciBjdXJyZW5jeSA9IHRoaXMucHJvcHMuYmlkID8gdGhpcy5wcm9wcy5jdXJyZW5jeSA6ICdFVVInO1xuICAgICAgICByZXR1cm4ge3BlcnNvbnM6IHBlcnNvbnMsIGN1cnJlbmN5OiBjdXJyZW5jeX07XG4gICAgfSxcbiAgICByZW1vdmVQZXJzb246IGZ1bmN0aW9uKGlkeCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZXJzb25zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwZXJzb25zOiBSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUucGVyc29ucywgeyRzcGxpY2U6IFtbaWR4LCAxXV19KVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24oZmllbGQsIHZhbHVlLCBpZHgpIHtcbiAgICAgICAgdmFyIHBlcnNvbnMgPSB0aGlzLnN0YXRlLnBlcnNvbnMuc2xpY2UoKTtcbiAgICAgICAgcGVyc29uc1tpZHhdW2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgICBkZWxldGUgcGVyc29uc1tpZHhdLnByaXN0aW5lO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwZXJzb25zOiBwZXJzb25zfSk7XG4gICAgfSxcbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3BlcnNvbnM6IHRoaXMuc3RhdGUucGVyc29ucy5jb25jYXQoW3tuYW1lOiAnSm9obiBEb2UnLCBwYWlkOiAnMCcsIHByaXN0aW5lOiB0cnVlfV0pfSk7XG4gICAgfSxcbiAgICBzaGFyZVRvdGFsOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wcy5vblNoYXJlVG90YWwodGhpcy5zdGF0ZS5wZXJzb25zKTtcbiAgICB9LFxuICAgIHRvZ2dsZVNldHRpbmdzOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uVG9nZ2xlU2V0dGluZ3MoKTtcbiAgICB9LFxuICAgIGRlbGV0ZUJpbGw6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucHJvcHMub25EZWxldGVCaWxsKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGVyc29ucyA9IHRoaXMuc3RhdGUucGVyc29ucy5tYXAoZnVuY3Rpb24ocGVyc29uLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxQZXJzb24ga2V5PXtpfSBpZHg9e2l9IGRhdGE9e3BlcnNvbn0gcGVyc29uQ291bnQ9e3RoaXMuc3RhdGUucGVyc29ucy5sZW5ndGh9IG9uUGVyc29uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZX0gb25EZWxldGU9e3RoaXMucmVtb3ZlUGVyc29uLmJpbmQodGhpcywgaSl9IGN1cnJlbmN5PXt0aGlzLnByb3BzLmN1cnJlbmN5fSBiaWQ9e3RoaXMucHJvcHMuYmlkfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB2YXIgZGVsZXRlQnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5iaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1sZyBidG4tcHJpbWFyeScgb25DbGljaz17dGhpcy5kZWxldGVCaWxsfT48aSBjbGFzc05hbWU9J2ZhIGZhLXRyYXNoLW8nPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IERlbGV0ZTwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtIGlkPSdwZXJzb25MaXN0JyBjbGFzc05hbWU9J2NvbC1tZC04Jz5cbiAgICAgICAgICAgICAgICB7cGVyc29uc31cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdoZWxwJyBjbGFzc05hbWU9J2NvbC14cy0xMic+UHJvdGlwOiB5b3UgY2FuIGVudGVyIG11bHRpcGxlIGFtb3VudHMgZm9yIHBlcnNvbiBieSBzZXBhcmF0aW5nIHRoZW0gYnkgc3BhY2UhPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD0nYnV0dG9ucycgY2xhc3NOYW1lPSdjb2wteHMtMTInPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1sZyBidG4tcHJpbWFyeScgb25DbGljaz17dGhpcy5hZGRQZXJzb259PjxpIGNsYXNzTmFtZT0nZmEgZmEtdXNlci1wbHVzJz48L2k+PHNwYW4gY2xhc3NOYW1lPSdoaWRkZW4teHMnPiBBZGQgcGVyc29uPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1sZyBidG4tcHJpbWFyeSBzZXR0aW5ncycgb25DbGljaz17dGhpcy50b2dnbGVTZXR0aW5nc30+PGkgY2xhc3NOYW1lPSdmYSBmYS1jb2cnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IFNldHRpbmdzPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1sZyBidG4tcHJpbWFyeScgb25DbGljaz17dGhpcy5zaGFyZVRvdGFsfT48aSBjbGFzc05hbWU9J2ZhIGZhLWNhbGN1bGF0b3InPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IFNoYXJlIHRvdGFsPC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICB7ZGVsZXRlQnV0dG9uKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGhhbmRsZUN1cnJlbmN5Q2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ3VycmVuY3lDaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXR0aW5nc0NsYXNzTmFtZSA9IHRoaXMucHJvcHMuc2hvd1NldHRpbmdzID8gJ2Zvcm0taG9yaXpvbnRhbCBjb2wteHMtMTInIDogJ2hpZGRlbic7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybSBpZD0nc2V0dGluZ3MnIGNsYXNzTmFtZT17c2V0dGluZ3NDbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmb3JtLWdyb3VwJz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9J2N1cnJlbmN5Jz5DdXJyZW5jeTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2N1cnJlbmN5JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgdmFsdWU9e3RoaXMucHJvcHMuY3VycmVuY3l9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUN1cnJlbmN5Q2hhbmdlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J0VVUic+RVVSPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSdVU0QnPlVTRDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsInZhciBfc29ydEJ5ID0gcmVxdWlyZSgnbG9kYXNoLnNvcnRieScpO1xudmFyIF9lYWNoID0gcmVxdWlyZSgnbG9kYXNoLmZvcmVhY2gnKTtcbnZhciBfcmVkdWNlID0gcmVxdWlyZSgnbG9kYXNoLnJlZHVjZScpO1xudmFyIF9maW5kID0gcmVxdWlyZSgnbG9kYXNoLmZpbmQnKTtcbnZhciBfcmVtb3ZlID0gcmVxdWlyZSgnbG9kYXNoLnJlbW92ZScpO1xuXG52YXIgcm91bmQgPSBmdW5jdGlvbihudW0pIHtcbiAgICByZXR1cm4gKyhNYXRoLnJvdW5kKG51bSArIFwiZSsyXCIpICArIFwiZS0yXCIpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5fSBBcnJheSBvZiBvYmplY3Qgd2l0aCBrZXlzIG5hbWUgYW5kIHBhaWQuXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHBheW1lbnQgZGV0YWlscy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHNvcnRlZCwgdG90YWwsIHNoYXJlLCBwYXltZW50cztcblxuICAgIC8vIFJlbW92ZSBpbnZhbGlkIHBlcnNvbnMuXG4gICAgX3JlbW92ZShkYXRhLCBmdW5jdGlvbihwZXJzb24pIHtcbiAgICAgICByZXR1cm4gIXBlcnNvbi5uYW1lIHx8IHBlcnNvbi5uYW1lLmxlbmd0aCA9PT0gMDtcbiAgICB9KTtcblxuICAgIC8vIFNvcnQgZGF0YSBieSBwYWlkIGFtb3VudCBhbmQgdGhlbiByZXZlcnNlLlxuICAgIHNvcnRlZCA9IF9zb3J0QnkoZGF0YSwgJ3BhaWQnKS5yZXZlcnNlKCk7XG5cbiAgICAvLyBBZGQgSUQgZm9yIGVhY2ggcGVyc29uLlxuICAgIF9lYWNoKHNvcnRlZCwgZnVuY3Rpb24ocGVyc29uLCBpZHgpIHtcbiAgICAgICBwZXJzb24uaWQgPSBpZHg7XG4gICAgICAgcGVyc29uLnBhaWQgPSBNYXRoLnJvdW5kKE51bWJlcihwZXJzb24ucGFpZCAqIDEwMCkpO1xuICAgIH0pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRvdGFsIGFtb3VudC5cbiAgICB0b3RhbCA9IF9yZWR1Y2Uoc29ydGVkLCBmdW5jdGlvbih0b3RhbCwgcGVyc29uKSB7XG4gICAgICAgIHJldHVybiB0b3RhbCArIHBlcnNvbi5wYWlkO1xuICAgIH0sIDApO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHNoYXJlIHBlciBwZXJzb24uXG4gICAgc2hhcmUgPSBzb3J0ZWQubGVuZ3RoID4gMCA/IE1hdGgucm91bmQoTnVtYmVyKHRvdGFsIC8gc29ydGVkLmxlbmd0aCkpIDogMDtcblxuICAgIC8vIE9iamVjdCBmb3Igc3RvcmluZyByZXN1bHRzLlxuICAgIHBheW1lbnRzID0ge307XG5cbiAgICAvLyBMb29wIHRocm91Z2ggcGVyc29ucy5cbiAgICBfZWFjaChzb3J0ZWQsIGZ1bmN0aW9uKHBlcnNvbikge1xuICAgICAgICAvLyBDYWxjYXVsYXRlIGhvdyBtdWNoIHBlcnNvbiBzdGlsbCBoYXMgdG8gcGF5IChvciByZWNlaXZlLCBpZiB0aGUgYW1vdW50IGlzIG5lZ2F0aXZlKS5cbiAgICAgICAgcGVyc29uLmxlZnQgPSBNYXRoLnJvdW5kKHNoYXJlIC0gcGVyc29uLnBhaWQpO1xuXG4gICAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgICAgLy8gTG9vcCB1bnRpbCBwZXJzb24gaGFzIHBhaWQgZW5vdWdoLlxuICAgICAgICB3aGlsZSAocGVyc29uLmxlZnQgPiAwKSB7XG4gICAgICAgICAgICBwYXltZW50c1twZXJzb24uaWRdID0gcGF5bWVudHNbcGVyc29uLmlkXSB8fCB7bmFtZTogcGVyc29uLm5hbWUsIHRvOiBbXX07XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IHBlcnNvbiB3aG8gaXMgdG8gcmVjZWl2ZSBtb25leS5cbiAgICAgICAgICAgIHRhcmdldCA9IF9maW5kKHNvcnRlZCwgZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgcmV0dXJuIHAubGVmdCA8IDA7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUGF5bWVudCByZWNlaXZlciBmb3VuZC5cbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvKiBDaGVjayBpZiBwYXlpbmcgcGVyc29uIGhhcyBtb3JlIG1vbmV5IHRoYW4gcmVjZWl2ZXIuXG4gICAgICAgICAgICAgICAgICogSWYgcGF5aW5nIGhhcyBtb3JlIHRoYW4gcmVjZWl2ZXIsIHRoZSBhbW91bnQgdG8gcGF5IGVxdWFscyB0aGUgYW1vdW50IHJlY2VpdmVyIGlzIHRvIGdldC5cbiAgICAgICAgICAgICAgICAgKiBJZiBwYXlpbmcgaGFzIGxlc3MgdGhhbiByZWNlaXZlciwgdGhlIGFtb3VudCB0byBwYXkgaXMgcmVzdCBvZiBwYXllcnMgZGVidC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50ID0gTWF0aC5hYnModGFyZ2V0LmxlZnQpID4gcGVyc29uLmxlZnQgPyBwZXJzb24ubGVmdCA6IE1hdGguYWJzKHRhcmdldC5sZWZ0KTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCB0byByZWNlaXZlciwgc3VidHJhY3QgZnJvbSBwYXllci5cbiAgICAgICAgICAgICAgICB0YXJnZXQubGVmdCArPSBhbW91bnQ7XG4gICAgICAgICAgICAgICAgcGVyc29uLmxlZnQgLT0gYW1vdW50O1xuXG4gICAgICAgICAgICAgICAgLy8gUHVzaCBkZXRhaWxzIGZvciByZXR1cm5pbmcuXG4gICAgICAgICAgICAgICAgcGF5bWVudHNbcGVyc29uLmlkXS50by5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdG86IHRhcmdldC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IE51bWJlcihhbW91bnQgLyAxMDApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENvdWxkIG5vdCBmaW5kIGFueSBwZXJzb24gd2hvIHN0aWxsIHNob3VkIHJlY2VpdmUgbW9uZXkuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gdG90YWwgd29uJ3QgZGl2aWRlIGVxdWFsbHkuXG4gICAgICAgICAgICAgICAgcGVyc29uLmxlZnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gcGF5bWVudHMgYW5kIG90aGVyIGRldGFpbHMuXG4gICAgcmV0dXJuIHtwYXltZW50czogcGF5bWVudHMsIHRvdGFsOiBOdW1iZXIodG90YWwgLyAxMDApLCBzaGFyZTogTnVtYmVyKHNoYXJlIC8gMTAwKX07XG59OyJdfQ==
