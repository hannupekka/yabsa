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