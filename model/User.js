var mongoose = require('mongoose');
const crypto = require('crypto')
// http://mongoosejs.com/docs/index.html
mongoose.connect('mongodb://localhost/loginn_passport_routes');
var db = mongoose.connection;

var UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: { type: String, index: true },
    email: String,
    password: String,
    salt: String,

});

/********************************************************************************************************* */
// Her kunne vi gjøre module.exports.createUser ==> men når vi kaller på metoden, skriver vi (module/klasse).createUser
// men nå UserSchema.methods.methode ==> skriver vi objekt.createUser uten å eksportere metoden
/********************************************************************************************************* */

UserSchema.methods.createUser = (newUser, clBk) => {
    var { salt, encrypted_password } = saltHashPassword(newUser.password)
    newUser.password = encrypted_password
    newUser.salt = salt

    //document can be saved to the database by calling its save method
    newUser.save(clBk) // after calling save we want to run clBk =(err,user)=>{if (err) throw err else console.log(user)}
}


UserSchema.methods.validPassword = (candidatePassword, encrypted_password, salt) => {
    var {encrypted_password : inputPassword }=  saltHashPassword(candidatePassword, salt)
    var isMatch = ( inputPassword === encrypted_password )
    return isMatch;
}



// NOTE: methods must be added to the schema before compiling it with mongoose.model()
module.exports = User = mongoose.model('User', UserSchema);

//static methods
module.exports.getUserByUsername = (userName, clBk) => {
    var query = { userName: userName };
    User.findOne(query, clBk);// after calling findOne we want to run clBk =(err,user)=>{if (err) throw err if (!user) {return done(null, false, { message: 'Unknown User' });}
}
module.exports.getUserById = function(id, clBk){
	User.findById(id, clBk);
}




randomString = () => {
    return crypto.randomBytes(4).toString('hex')
}

saltHashPassword = ( password, salt ) => {
    salt = (salt === null || salt === undefined)  ? randomString() : salt
    const hmac = crypto.createHmac('sha512', salt)
    const hash = hmac.update(password)
    const encrypted_password = hash.digest('hex')
    return {
        salt,
        encrypted_password: encrypted_password
    }
}
