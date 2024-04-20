const moment = require('moment')
var a = moment();
var b = moment('08-1995', 'MM-YYYY');
var age = moment.duration(a.diff(b));
var years = age.years();
var months = age.months();
console.log("The age is " + years + " years " + months + " months ");