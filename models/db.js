/**
 * Created by maxd on 15-9-17.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.0.50/big_data_in_lanzhou');

module.exports = mongoose;