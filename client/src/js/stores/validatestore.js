var Reflux = require('reflux');
var ValidateActions = require('../actions/validateactions.js');
var PersonStore = require('./personstore.js');

var ValidateStore = Reflux.createStore({
    listenables: [ValidateActions],
    results: {
        persons: [],
        valid: false
    },
    init: function() {
        this.listenTo(PersonStore, this.validateForm, this.validateInitialForm);
    },
    getInitialState: function() {
        return this.results;
    },
    validateInitialForm: function(persons) {
        this.results.persons = this.parsePersons(persons, true);
        this.trigger(this.results);
    },
    validateForm: function(persons) {
        this.results.persons = this.parsePersons(persons, false);

        this.results.valid = this.results.persons.every(function(person) {
            return person.name === true && person.paid === true;
        });

        this.trigger(this.results);
    },
    parsePersons: function(persons, initial) {
        return persons.personList.map(function(person, i) {
            var isNameValid = initial;
            var isPaidValid = initial;

            isNameValid = typeof person.name !== 'undefined' ? person.name.length > 0 : 'pristine';
            isPaidValid = typeof person.paid !== 'undefined' ? person.paid.match(/^[\d,. ]+$/) !== null : 'pristine';

            return {
                name: isNameValid,
                paid: isPaidValid
            }
        });
    }
});

module.exports = ValidateStore;