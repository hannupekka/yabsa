/** @jsx React.DOM */
var React = require('react'),
    ReactIntl = require('react-intl'),
    IntlMixin = ReactIntl.IntlMixin,
    FormattedNumber = ReactIntl.FormattedNumber;

module.exports = React.createClass({
    mixins: [IntlMixin],
    render: function () {
        return (
            <div className='paymentList__transaction clearfix'>
                <div className='transaction__amount'>
                    <FormattedNumber value={this.props.amount} style="currency" currency="EUR" /><i className='fa fa-long-arrow-right'></i>{this.props.to}
                </div>
            </div>
        );
    }
});
