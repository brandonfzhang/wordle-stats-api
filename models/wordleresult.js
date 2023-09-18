var mongoose = require('mongoose');

var WordleResultSchema = new mongoose.Schema({
    number: {required: true, unique: true, type: Number}, //which number wordle the results are for
    score: {required: true, type: Number, default: 7}, //how many guesses it took (fails count as a score of 7)
    hardMode: {required: true, type: Boolean, default: false}, //whether hard mode was used in the wordle or not
    date: {required: true, type: Date}
});

module.exports = mongoose.model('WordleResult', WordleResultSchema);
