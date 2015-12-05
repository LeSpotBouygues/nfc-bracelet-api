/**
 * Created by superphung on 11/29/15.
 */
var mongoose = require('mongoose');

var companionSchema;

companionSchema = mongoose.Schema({
    name: {type: String},
    chief: {type: Boolean, default: false},
    bracelet: {type: String}
});

exports.Campanion = mongoose.model('Companion', companionSchema);