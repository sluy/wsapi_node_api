
const { dropAllExpired } = require('../repositories/instances.js');
dropAllExpired().then(function() {
  console.log('Done');
});





