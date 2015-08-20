var Reflux = require('reflux');
var PersonActions = require('../actions/personactions.js');

var Data = function() {
    return {
        personList: [],
        payments: {},
        total: 0,
        share: 0
    }
};

var PersonStore = Reflux.createStore({
    listenables: [PersonActions],
    persons: new Data(),
    init: function() {
        this.addPerson();
    },
    getInitialState: function() {
        return this.persons;
    },
    addPerson: function() {
        this.persons.personList.push({
            name: 'John Doe',
            paid: '0',
            pristine: true
        });
        this.trigger(this.persons);
    },
    editPerson: function(field, value, idx) {
        this.persons.personList[idx][field] = value;
        if (this.persons.personList[idx].pristine) {
            delete this.persons.personList[idx].pristine;
        }
        this.trigger(this.persons);
    },
    deletePerson: function(idx) {
        this.persons.personList.splice(idx, 1);
        this.trigger(this.persons);
    },
    shareTotal: function(results) {
        this.persons.payments = results.payments;
        this.persons.total = results.total;
        this.persons.share = results.share;
        this.trigger(this.persons);
    },
    setPersons: function(persons) {
        this.persons.personList = persons;
        this.trigger(this.persons);
    },
    reset: function() {
        this.persons = new Data();
        this.addPerson();
        this.trigger(this.persons);
    }
});

module.exports = PersonStore;