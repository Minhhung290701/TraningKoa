var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    _id : mongoose.Types.ObjectId,
    id: Number,
    fullname: String,
    username: String,
    password: String,
    birthday: Number
});

var User = mongoose.model('User', userSchema);

module.exports = User;
