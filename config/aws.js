/**
 * Created by nana on 20/02/2016.
 */
var AWS = require('aws-sdk');

var credentials = new AWS.SharedIniFileCredentials({profile: 'bouygues-s3'});

AWS.config.credentials = credentials;

module.exports = AWS;