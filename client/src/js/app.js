var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    PaymentWrapper = require('./components/paymentwrapper.jsx'),
    routes = (
        <Route handler={PaymentWrapper}>
            <Route name="index" path="/" handler={PaymentWrapper}/>
            <Route name="bill" path="/:bid" handler={PaymentWrapper}/>
        </Route>
    );

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.getElementById('wrapper'));
});
