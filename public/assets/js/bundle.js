(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var PaymentWrapper = require('./components/paymentwrapper.jsx');

var routes = (
    React.createElement(Route, {handler: PaymentWrapper}, 
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
        this.setState({payments: results.payments, total: results.total, share: results.share});
    },
    render: function() {
        var router = this.context.router;
        return (
            React.createElement("div", null, 
                React.createElement(Settings, {onCurrencyChange: this.changeCurrency, showSettings: this.state.showSettings}), 
                React.createElement(PersonList, {onShareTotal: this.shareTotal, currency: this.state.currency, onToggleSettings: this.toggleSettings, bid: this.state.bid}), 
                React.createElement(PaymentList, {payments: this.state.payments, total: this.state.total, share: this.state.share, currency: this.state.currency})
            )
        );
    }
});

},{"../functions.js":8,"./paymentlist.jsx":3,"./personlist.jsx":6,"./settings.jsx":7,"react":"react","react-router":"react-router"}],5:[function(require,module,exports){
/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({displayName: "exports",
    handleChange: function(field, event) {
        this.props.onPersonChange(field, event.target.value, this.props.idx);
    },
    render: function() {
        var buttonClass = this.props.personCount === 1 ? 'hidden' : 'col-xs-1';
        var nameValue = this.props.bid ? this.props.name : undefined;
        var paidValue = this.props.bid ? this.props.paid : undefined;
        return (
            React.createElement("div", {className: "personList__person clearfix"}, 
                React.createElement("div", {className: "person__name col-xs-4"}, 
                    React.createElement("input", {type: "text", className: "form-control input-lg", placeholder: this.props.name, value: nameValue, onChange: this.handleChange.bind(this, 'name'), autoFocus: true})
                ), 
                React.createElement("div", {className: "person__paid col-xs-6"}, 
                    React.createElement("div", {className: "input-group"}, 
                        React.createElement("input", {type: "tel", className: "form-control input-lg", placeholder: this.props.paid, value: paidValue, onChange: this.handleChange.bind(this, 'paid')}), 
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
var httpinvoke = require('httpinvoke');

module.exports = React.createClass({displayName: "exports",
    componentDidMount: function() {
        var baseUrl = window.location.origin;
        if (this.props.bid) {
            httpinvoke(baseUrl + '/api/v1/bill/' + this.props.bid, 'GET', function(error, body, statusCode) {
                var data = JSON.parse(body);
                this.setState({persons: data.data});
            }.bind(this));
        }
    },
    getInitialState: function() {
        var persons = this.props.bid ? [] : [{
            'name': 'John Doe',
            'paid': '0'
        }];
        return {persons: persons};
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
        this.setState({persons: persons});
    },
    addPerson: function(event) {
        event.preventDefault();
        this.setState({persons: this.state.persons.concat([{name: 'John Doe', paid: 0}])});
    },
    shareTotal: function(event) {
        event.preventDefault();
        this.props.onShareTotal(this.state.persons);
    },
    toggleSettings: function(event) {
        event.preventDefault();
        this.props.onToggleSettings();
    },
    render: function() {
        var persons = this.state.persons.map(function(person, i) {
            return (
                React.createElement(Person, {key: i, idx: i, name: person.name, paid: person.paid, personCount: this.state.persons.length, onPersonChange: this.handleChange, onDelete: this.removePerson.bind(this, i), currency: this.props.currency, bid: this.props.bid})
            );
        }.bind(this));

        return (
            React.createElement("form", {id: "personList", className: "col-md-8"}, 
                persons, 
                React.createElement("div", {id: "help", className: "col-xs-12"}, "Protip: you can enter multiple amounts for person by separating them by space!"), 
                React.createElement("div", {id: "buttons", className: "col-xs-12"}, 
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.addPerson}, React.createElement("i", {className: "fa fa-user-plus"}), React.createElement("span", {className: "hidden-xs"}, " Add person")), 
                    React.createElement("button", {className: "btn btn-lg btn-primary settings", onClick: this.toggleSettings}, React.createElement("i", {className: "fa fa-cog"}), React.createElement("span", {className: "hidden-xs"}, " Settings")), 
                    React.createElement("button", {className: "btn btn-lg btn-primary", onClick: this.shareTotal}, React.createElement("i", {className: "fa fa-calculator"}), React.createElement("span", {className: "hidden-xs"}, " Share total"))
                )
            )
        );
    }
});

},{"./person.jsx":5,"httpinvoke":"httpinvoke","react/addons":"react/addons"}],7:[function(require,module,exports){
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
                    React.createElement("select", {id: "currency", className: "form-control input-lg", onChange: this.handleCurrencyChange}, 
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9hcHAuanMiLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3BheW1lbnQuanN4IiwiL3Zhci93d3cvZGV2L2JpbGxlci9zcmMvanMvY29tcG9uZW50cy9wYXltZW50bGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29uLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2NvbXBvbmVudHMvcGVyc29ubGlzdC5qc3giLCIvdmFyL3d3dy9kZXYvYmlsbGVyL3NyYy9qcy9jb21wb25lbnRzL3NldHRpbmdzLmpzeCIsIi92YXIvd3d3L2Rldi9iaWxsZXIvc3JjL2pzL2Z1bmN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUN6QixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQzs7QUFFaEUsSUFBSSxNQUFNO0lBQ04sb0JBQUMsS0FBSyxFQUFBLENBQUEsQ0FBQyxPQUFBLEVBQU8sQ0FBRSxjQUFnQixDQUFBLEVBQUE7UUFDNUIsb0JBQUMsS0FBSyxFQUFBLENBQUEsQ0FBQyxJQUFBLEVBQUksQ0FBQyxNQUFBLEVBQU0sQ0FBQyxJQUFBLEVBQUksQ0FBQyxPQUFBLEVBQU8sQ0FBQyxPQUFBLEVBQU8sQ0FBRSxjQUFlLENBQUUsQ0FB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QUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN2RiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xudmFyIFJvdXRlID0gUm91dGVyLlJvdXRlO1xudmFyIFBheW1lbnRXcmFwcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BheW1lbnR3cmFwcGVyLmpzeCcpO1xuXG52YXIgcm91dGVzID0gKFxuICAgIDxSb3V0ZSBoYW5kbGVyPXtQYXltZW50V3JhcHBlcn0+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiYmlsbFwiIHBhdGg9XCIvOmJpZFwiIGhhbmRsZXI9e1BheW1lbnRXcmFwcGVyfS8+XG4gICAgPC9Sb3V0ZT5cbik7XG5cblJvdXRlci5ydW4ocm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXBwZXInKSk7XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgbWl4aW5zOiBbSW50bE1peGluXSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X190cmFuc2FjdGlvbiBjbGVhcmZpeCBjb2wtbWQtMTInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMyBjb2wtbWQtNCB0cmFuc2FjdGlvbl9fYW1vdW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5wcm9wcy5hbW91bnR9IHN0eWxlPVwiY3VycmVuY3lcIiBjdXJyZW5jeT1cIkVVUlwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy05IGNvbC1tZC04Jz5cbiAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPSdmYSBmYS1sb25nLWFycm93LXJpZ2h0Jz48L2k+IHt0aGlzLnByb3BzLnRvfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFBheW1lbnQgPSByZXF1aXJlKCcuL3BheW1lbnQuanN4Jyk7XG52YXIgUmVhY3RJbnRsID0gcmVxdWlyZSgncmVhY3QtaW50bCcpO1xudmFyIEludGxNaXhpbiA9IFJlYWN0SW50bC5JbnRsTWl4aW47XG52YXIgRm9ybWF0dGVkTnVtYmVyID0gUmVhY3RJbnRsLkZvcm1hdHRlZE51bWJlcjtcbnZhciBfbWFwID0gcmVxdWlyZSgnbG9kYXNoLm1hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBtaXhpbnM6IFtJbnRsTWl4aW5dLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXltZW50cyA9IF9tYXAodGhpcy5wcm9wcy5wYXltZW50cywgZnVuY3Rpb24ocGF5bWVudCwgaSkge1xuICAgICAgICAgICAgdmFyIHBlcnNvbnNQYXltZW50cyA9IHBheW1lbnQudG8ubWFwKGZ1bmN0aW9uKHAsaikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxQYXltZW50IGtleT17an0gdG89e3AudG99IGFtb3VudD17cC5hbW91bnR9IC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9J3BheW1lbnRMaXN0X19wYXltZW50IGNsZWFyZml4Jz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BheW1lbnRMaXN0X19mcm9tJz57cGF5bWVudC5uYW1lfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncGF5bWVudExpc3RfX3RyYW5zYWN0aW9ucyBjbGVhcmZpeCBiZy1wcmltYXJ5Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwZXJzb25zUGF5bWVudHN9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgaWQ9J3BheW1lbnRMaXN0JyBjbGFzc05hbWU9J2NvbC1tZC00Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nc3RhdHMnPlxuICAgICAgICAgICAgICAgICAgICA8Yj5Ub3RhbDogPC9iPiA8Rm9ybWF0dGVkTnVtYmVyIHZhbHVlPXt0aGlzLnByb3BzLnRvdGFsfSBzdHlsZT0nY3VycmVuY3knIGN1cnJlbmN5PXt0aGlzLnByb3BzLmN1cnJlbmN5fSAvPiA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGI+U2hhcmU6IDwvYj4gPEZvcm1hdHRlZE51bWJlciB2YWx1ZT17dGhpcy5wcm9wcy5zaGFyZX0gc3R5bGU9J2N1cnJlbmN5JyBjdXJyZW5jeT17dGhpcy5wcm9wcy5jdXJyZW5jeX0gLz4gPGJyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3BheW1lbnRzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFBlcnNvbkxpc3QgPSByZXF1aXJlKCcuL3BlcnNvbmxpc3QuanN4Jyk7XG52YXIgUGF5bWVudExpc3QgPSByZXF1aXJlKCcuL3BheW1lbnRsaXN0LmpzeCcpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncy5qc3gnKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKCdyZWFjdC1yb3V0ZXInKTtcbnZhciBzaGFyZUJpbGwgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29udGV4dFR5cGVzOiB7XG4gICAgICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7cGF5bWVudHM6IHt9LCB0b3RhbDogMCwgc2hhcmU6IDAsIGN1cnJlbmN5OiAnRVVSJywgc2hvd1NldHRpbmdzOiBmYWxzZSwgYmlkOiB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5iaWQgfHwgZmFsc2V9O1xuICAgIH0sXG4gICAgY2hhbmdlQ3VycmVuY3k6IGZ1bmN0aW9uKGN1cnJlbmN5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW5jeTogY3VycmVuY3l9KTtcbiAgICB9LFxuICAgIHRvZ2dsZVNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dTZXR0aW5nczogIXRoaXMuc3RhdGUuc2hvd1NldHRpbmdzfSk7XG4gICAgfSxcbiAgICBzaGFyZVRvdGFsOiBmdW5jdGlvbihwZXJzb25zKSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIHBlcnNvbkNvdW50ID0gcGVyc29ucy5sZW5ndGg7XG4gICAgICAgIHZhciBwZXJzb247XG4gICAgICAgIHZhciBwYWlkO1xuICAgICAgICBmb3IgKDsgaSA8IHBlcnNvbkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHBlcnNvbiA9IHBlcnNvbnNbaV07XG4gICAgICAgICAgICAvLyBTdW0gYW1vdW50cyBpZiBtdWx0aXBsZSBnaXZlbi4gQWxzbyByZXBsYWNlIGNvbW1hcy5cbiAgICAgICAgICAgIHBhaWQgPSB0eXBlb2YgcGVyc29uLnBhaWQgPT09ICdzdHJpbmcnID8gcGVyc29uLnBhaWQuc3BsaXQoJyAnKS5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIocHJldikgKyBOdW1iZXIoY3VycmVudC5yZXBsYWNlKCcsJywgJy4nKSk7XG4gICAgICAgICAgICB9LCAwKSA6IHBlcnNvbi5wYWlkO1xuICAgICAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwZXJzb24ubmFtZSxcbiAgICAgICAgICAgICAgICBwYWlkOiBOdW1iZXIocGFpZClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHRzID0gc2hhcmVCaWxsKGRhdGEpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwYXltZW50czogcmVzdWx0cy5wYXltZW50cywgdG90YWw6IHJlc3VsdHMudG90YWwsIHNoYXJlOiByZXN1bHRzLnNoYXJlfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcm91dGVyID0gdGhpcy5jb250ZXh0LnJvdXRlcjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPFNldHRpbmdzIG9uQ3VycmVuY3lDaGFuZ2U9e3RoaXMuY2hhbmdlQ3VycmVuY3l9IHNob3dTZXR0aW5ncz17dGhpcy5zdGF0ZS5zaG93U2V0dGluZ3N9IC8+XG4gICAgICAgICAgICAgICAgPFBlcnNvbkxpc3Qgb25TaGFyZVRvdGFsPXt0aGlzLnNoYXJlVG90YWx9IGN1cnJlbmN5PXt0aGlzLnN0YXRlLmN1cnJlbmN5fSBvblRvZ2dsZVNldHRpbmdzPXt0aGlzLnRvZ2dsZVNldHRpbmdzfSBiaWQ9e3RoaXMuc3RhdGUuYmlkfS8+XG4gICAgICAgICAgICAgICAgPFBheW1lbnRMaXN0IHBheW1lbnRzPXt0aGlzLnN0YXRlLnBheW1lbnRzfSB0b3RhbD17dGhpcy5zdGF0ZS50b3RhbH0gc2hhcmU9e3RoaXMuc3RhdGUuc2hhcmV9IGN1cnJlbmN5PXt0aGlzLnN0YXRlLmN1cnJlbmN5fSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGZpZWxkLCBldmVudCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGVyc29uQ2hhbmdlKGZpZWxkLCBldmVudC50YXJnZXQudmFsdWUsIHRoaXMucHJvcHMuaWR4KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBidXR0b25DbGFzcyA9IHRoaXMucHJvcHMucGVyc29uQ291bnQgPT09IDEgPyAnaGlkZGVuJyA6ICdjb2wteHMtMSc7XG4gICAgICAgIHZhciBuYW1lVmFsdWUgPSB0aGlzLnByb3BzLmJpZCA/IHRoaXMucHJvcHMubmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHBhaWRWYWx1ZSA9IHRoaXMucHJvcHMuYmlkID8gdGhpcy5wcm9wcy5wYWlkIDogdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbkxpc3RfX3BlcnNvbiBjbGVhcmZpeCc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbl9fbmFtZSBjb2wteHMtNCc+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e25hbWVWYWx1ZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ25hbWUnKX0gYXV0b0ZvY3VzIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BlcnNvbl9fcGFpZCBjb2wteHMtNic+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdpbnB1dC1ncm91cCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0ndGVsJyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGFpZH0gdmFsdWU9e3BhaWRWYWx1ZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3BhaWQnKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIj57dGhpcy5wcm9wcy5jdXJyZW5jeX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2J1dHRvbkNsYXNzfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSBidG4tc20gYnRuLXJlbW92ZScgb25DbGljaz17dGhpcy5wcm9wcy5vbkRlbGV0ZX0gdGFiSW5kZXg9Jy0xJz48aSBjbGFzc05hbWU9J2ZhIGZhLW1pbnVzJz48L2k+PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUGVyc29uID0gcmVxdWlyZSgnLi9wZXJzb24uanN4Jyk7XG52YXIgaHR0cGludm9rZSA9IHJlcXVpcmUoJ2h0dHBpbnZva2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW47XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJpZCkge1xuICAgICAgICAgICAgaHR0cGludm9rZShiYXNlVXJsICsgJy9hcGkvdjEvYmlsbC8nICsgdGhpcy5wcm9wcy5iaWQsICdHRVQnLCBmdW5jdGlvbihlcnJvciwgYm9keSwgc3RhdHVzQ29kZSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtwZXJzb25zOiBkYXRhLmRhdGF9KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwZXJzb25zID0gdGhpcy5wcm9wcy5iaWQgPyBbXSA6IFt7XG4gICAgICAgICAgICAnbmFtZSc6ICdKb2huIERvZScsXG4gICAgICAgICAgICAncGFpZCc6ICcwJ1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIHtwZXJzb25zOiBwZXJzb25zfTtcbiAgICB9LFxuICAgIHJlbW92ZVBlcnNvbjogZnVuY3Rpb24oaWR4KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBlcnNvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBlcnNvbnM6IFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZS5wZXJzb25zLCB7JHNwbGljZTogW1tpZHgsIDFdXX0pXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihmaWVsZCwgdmFsdWUsIGlkeCkge1xuICAgICAgICB2YXIgcGVyc29ucyA9IHRoaXMuc3RhdGUucGVyc29ucy5zbGljZSgpO1xuICAgICAgICBwZXJzb25zW2lkeF1bZmllbGRdID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3BlcnNvbnM6IHBlcnNvbnN9KTtcbiAgICB9LFxuICAgIGFkZFBlcnNvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGVyc29uczogdGhpcy5zdGF0ZS5wZXJzb25zLmNvbmNhdChbe25hbWU6ICdKb2huIERvZScsIHBhaWQ6IDB9XSl9KTtcbiAgICB9LFxuICAgIHNoYXJlVG90YWw6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucHJvcHMub25TaGFyZVRvdGFsKHRoaXMuc3RhdGUucGVyc29ucyk7XG4gICAgfSxcbiAgICB0b2dnbGVTZXR0aW5nczogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblRvZ2dsZVNldHRpbmdzKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGVyc29ucyA9IHRoaXMuc3RhdGUucGVyc29ucy5tYXAoZnVuY3Rpb24ocGVyc29uLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxQZXJzb24ga2V5PXtpfSBpZHg9e2l9IG5hbWU9e3BlcnNvbi5uYW1lfSBwYWlkPXtwZXJzb24ucGFpZH0gcGVyc29uQ291bnQ9e3RoaXMuc3RhdGUucGVyc29ucy5sZW5ndGh9IG9uUGVyc29uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZX0gb25EZWxldGU9e3RoaXMucmVtb3ZlUGVyc29uLmJpbmQodGhpcywgaSl9IGN1cnJlbmN5PXt0aGlzLnByb3BzLmN1cnJlbmN5fSBiaWQ9e3RoaXMucHJvcHMuYmlkfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm0gaWQ9J3BlcnNvbkxpc3QnIGNsYXNzTmFtZT0nY29sLW1kLTgnPlxuICAgICAgICAgICAgICAgIHtwZXJzb25zfVxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J2hlbHAnIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5Qcm90aXA6IHlvdSBjYW4gZW50ZXIgbXVsdGlwbGUgYW1vdW50cyBmb3IgcGVyc29uIGJ5IHNlcGFyYXRpbmcgdGhlbSBieSBzcGFjZSE8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdidXR0b25zJyBjbGFzc05hbWU9J2NvbC14cy0xMic+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLmFkZFBlcnNvbn0+PGkgY2xhc3NOYW1lPSdmYSBmYS11c2VyLXBsdXMnPjwvaT48c3BhbiBjbGFzc05hbWU9J2hpZGRlbi14cyc+IEFkZCBwZXJzb248L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5IHNldHRpbmdzJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVNldHRpbmdzfT48aSBjbGFzc05hbWU9J2ZhIGZhLWNvZyc+PC9pPjxzcGFuIGNsYXNzTmFtZT0naGlkZGVuLXhzJz4gU2V0dGluZ3M8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLWxnIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXt0aGlzLnNoYXJlVG90YWx9PjxpIGNsYXNzTmFtZT0nZmEgZmEtY2FsY3VsYXRvcic+PC9pPjxzcGFuIGNsYXNzTmFtZT0naGlkZGVuLXhzJz4gU2hhcmUgdG90YWw8L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGhhbmRsZUN1cnJlbmN5Q2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ3VycmVuY3lDaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXR0aW5nc0NsYXNzTmFtZSA9IHRoaXMucHJvcHMuc2hvd1NldHRpbmdzID8gJ2Zvcm0taG9yaXpvbnRhbCBjb2wteHMtMTInIDogJ2hpZGRlbic7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybSBpZD0nc2V0dGluZ3MnIGNsYXNzTmFtZT17c2V0dGluZ3NDbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmb3JtLWdyb3VwJz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9J2N1cnJlbmN5Jz5DdXJyZW5jeTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgaWQ9J2N1cnJlbmN5JyBjbGFzc05hbWU9J2Zvcm0tY29udHJvbCBpbnB1dC1sZycgb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ3VycmVuY3lDaGFuZ2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nRVVSJz5FVVI8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9J1VTRCc+VVNEPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwidmFyIF9zb3J0QnkgPSByZXF1aXJlKCdsb2Rhc2guc29ydGJ5Jyk7XG52YXIgX2VhY2ggPSByZXF1aXJlKCdsb2Rhc2guZm9yZWFjaCcpO1xudmFyIF9yZWR1Y2UgPSByZXF1aXJlKCdsb2Rhc2gucmVkdWNlJyk7XG52YXIgX2ZpbmQgPSByZXF1aXJlKCdsb2Rhc2guZmluZCcpO1xudmFyIF9yZW1vdmUgPSByZXF1aXJlKCdsb2Rhc2gucmVtb3ZlJyk7XG5cbnZhciByb3VuZCA9IGZ1bmN0aW9uKG51bSkge1xuICAgIHJldHVybiArKE1hdGgucm91bmQobnVtICsgXCJlKzJcIikgICsgXCJlLTJcIik7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXl9IEFycmF5IG9mIG9iamVjdCB3aXRoIGtleXMgbmFtZSBhbmQgcGFpZC5cbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiBvYmplY3RzIHdpdGggcGF5bWVudCBkZXRhaWxzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgc29ydGVkLCB0b3RhbCwgc2hhcmUsIHBheW1lbnRzO1xuXG4gICAgLy8gUmVtb3ZlIGludmFsaWQgcGVyc29ucy5cbiAgICBfcmVtb3ZlKGRhdGEsIGZ1bmN0aW9uKHBlcnNvbikge1xuICAgICAgIHJldHVybiAhcGVyc29uLm5hbWUgfHwgcGVyc29uLm5hbWUubGVuZ3RoID09PSAwO1xuICAgIH0pO1xuXG4gICAgLy8gU29ydCBkYXRhIGJ5IHBhaWQgYW1vdW50IGFuZCB0aGVuIHJldmVyc2UuXG4gICAgc29ydGVkID0gX3NvcnRCeShkYXRhLCAncGFpZCcpLnJldmVyc2UoKTtcblxuICAgIC8vIEFkZCBJRCBmb3IgZWFjaCBwZXJzb24uXG4gICAgX2VhY2goc29ydGVkLCBmdW5jdGlvbihwZXJzb24sIGlkeCkge1xuICAgICAgIHBlcnNvbi5pZCA9IGlkeDtcbiAgICAgICBwZXJzb24ucGFpZCA9IE1hdGgucm91bmQoTnVtYmVyKHBlcnNvbi5wYWlkICogMTAwKSk7XG4gICAgfSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgdG90YWwgYW1vdW50LlxuICAgIHRvdGFsID0gX3JlZHVjZShzb3J0ZWQsIGZ1bmN0aW9uKHRvdGFsLCBwZXJzb24pIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgcGVyc29uLnBhaWQ7XG4gICAgfSwgMCk7XG5cbiAgICAvLyBDYWxjdWxhdGUgc2hhcmUgcGVyIHBlcnNvbi5cbiAgICBzaGFyZSA9IHNvcnRlZC5sZW5ndGggPiAwID8gTWF0aC5yb3VuZChOdW1iZXIodG90YWwgLyBzb3J0ZWQubGVuZ3RoKSkgOiAwO1xuXG4gICAgLy8gT2JqZWN0IGZvciBzdG9yaW5nIHJlc3VsdHMuXG4gICAgcGF5bWVudHMgPSB7fTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBwZXJzb25zLlxuICAgIF9lYWNoKHNvcnRlZCwgZnVuY3Rpb24ocGVyc29uKSB7XG4gICAgICAgIC8vIENhbGNhdWxhdGUgaG93IG11Y2ggcGVyc29uIHN0aWxsIGhhcyB0byBwYXkgKG9yIHJlY2VpdmUsIGlmIHRoZSBhbW91bnQgaXMgbmVnYXRpdmUpLlxuICAgICAgICBwZXJzb24ubGVmdCA9IE1hdGgucm91bmQoc2hhcmUgLSBwZXJzb24ucGFpZCk7XG5cbiAgICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgICAvLyBMb29wIHVudGlsIHBlcnNvbiBoYXMgcGFpZCBlbm91Z2guXG4gICAgICAgIHdoaWxlIChwZXJzb24ubGVmdCA+IDApIHtcbiAgICAgICAgICAgIHBheW1lbnRzW3BlcnNvbi5pZF0gPSBwYXltZW50c1twZXJzb24uaWRdIHx8IHtuYW1lOiBwZXJzb24ubmFtZSwgdG86IFtdfTtcblxuICAgICAgICAgICAgLy8gRmluZCB0aGUgZmlyc3QgcGVyc29uIHdobyBpcyB0byByZWNlaXZlIG1vbmV5LlxuICAgICAgICAgICAgdGFyZ2V0ID0gX2ZpbmQoc29ydGVkLCBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICByZXR1cm4gcC5sZWZ0IDwgMDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBQYXltZW50IHJlY2VpdmVyIGZvdW5kLlxuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8qIENoZWNrIGlmIHBheWluZyBwZXJzb24gaGFzIG1vcmUgbW9uZXkgdGhhbiByZWNlaXZlci5cbiAgICAgICAgICAgICAgICAgKiBJZiBwYXlpbmcgaGFzIG1vcmUgdGhhbiByZWNlaXZlciwgdGhlIGFtb3VudCB0byBwYXkgZXF1YWxzIHRoZSBhbW91bnQgcmVjZWl2ZXIgaXMgdG8gZ2V0LlxuICAgICAgICAgICAgICAgICAqIElmIHBheWluZyBoYXMgbGVzcyB0aGFuIHJlY2VpdmVyLCB0aGUgYW1vdW50IHRvIHBheSBpcyByZXN0IG9mIHBheWVycyBkZWJ0LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHZhciBhbW91bnQgPSBNYXRoLmFicyh0YXJnZXQubGVmdCkgPiBwZXJzb24ubGVmdCA/IHBlcnNvbi5sZWZ0IDogTWF0aC5hYnModGFyZ2V0LmxlZnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRvIHJlY2VpdmVyLCBzdWJ0cmFjdCBmcm9tIHBheWVyLlxuICAgICAgICAgICAgICAgIHRhcmdldC5sZWZ0ICs9IGFtb3VudDtcbiAgICAgICAgICAgICAgICBwZXJzb24ubGVmdCAtPSBhbW91bnQ7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXNoIGRldGFpbHMgZm9yIHJldHVybmluZy5cbiAgICAgICAgICAgICAgICBwYXltZW50c1twZXJzb24uaWRdLnRvLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0bzogdGFyZ2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFtb3VudDogTnVtYmVyKGFtb3VudCAvIDEwMClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgbm90IGZpbmQgYW55IHBlcnNvbiB3aG8gc3RpbGwgc2hvdWQgcmVjZWl2ZSBtb25leS5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgd2hlbiB0b3RhbCB3b24ndCBkaXZpZGUgZXF1YWxseS5cbiAgICAgICAgICAgICAgICBwZXJzb24ubGVmdCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJldHVybiBwYXltZW50cyBhbmQgb3RoZXIgZGV0YWlscy5cbiAgICByZXR1cm4ge3BheW1lbnRzOiBwYXltZW50cywgdG90YWw6IE51bWJlcih0b3RhbCAvIDEwMCksIHNoYXJlOiBOdW1iZXIoc2hhcmUgLyAxMDApfTtcbn07Il19
