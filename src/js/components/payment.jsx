/** @jsx React.DOM */
var React = require('react');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;

module.exports = React.createClass({
    render: function() {
        return (
            <div className='paymentList__transaction clearfix col-md-12'>
                <div className='col-xs-3 col-md-4 transaction__amount'>
                    <FormattedNumber value={this.props.amount} style="currency" currency="EUR" />
                </div>
                <div className='col-xs-9 col-md-8'>
                    <i className='fa fa-long-arrow-right'></i> {this.props.to}
                </div>
            </div>
        );
    }
});