var data = [
    {name: 'bob', paid: 0},
    {name: 'kelso', paid: 100},
    {name: 'don', paid: 100},
    {}
];
var shareBill = require('./src/js/functions.js');
var results = shareBill(data);
console.log(results);