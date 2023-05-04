const fs = require('fs');
let config = null;
if (!config) {
  config = {};  
  try {
    const tmp = JSON.parse(fs.readFileSync(__dirname +'/config.json').toString().trim());
    if (typeof tmp === 'object' && tmp !== null) {
      config = tmp;
    }
  } catch (error) {
    console.log('AL CARGAR CONFIG', error);
  }
}
module.exports = config;




