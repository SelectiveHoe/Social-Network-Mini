const crypto = require('crypto');
const crypto_key = "23j84Fh2348ERF23h4423hdS4uhoDSiuSDFehRrh";

exports.encrypt = (text) => 
{
    var mykey = crypto.createCipher('aes-128-cbc', crypto_key);
    var mystr = mykey.update(text, 'utf8', 'hex');
    mystr += mykey.final('hex');
    return mystr;
  }
   
exports.decrypt = (text) =>
{
    var mykey = crypto.createDecipher('aes-128-cbc', crypto_key);
    var mystr = mykey.update(text, 'hex', 'utf8');
    mystr += mykey.final('utf8');
    return dec;
  }