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
