var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var PaymentWrapper = require('./components/paymentwrapper.jsx');

var routes = (
    <Route handler={PaymentWrapper}>
        <Route name="bill" path="/:bid" handler={PaymentWrapper}/>
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('wrapper'));
});