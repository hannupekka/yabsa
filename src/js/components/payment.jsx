/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className='paymentList__payment'>
                {this.props.amount} to {this.props.to}
            </div>
        );
    }
});