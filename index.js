/**
 * Created by superphung on 11/28/15.
 */
var app = require('./app');

require('./routes/companion');

app.listen(process.env.PORT || 3000);