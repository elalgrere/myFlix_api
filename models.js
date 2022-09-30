const mongoose = require('mongoose');




let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: { type: String, requiered: true},
    Genre: {
        Name: String,
        Description: String
},
Director: {
    Name: String,
    Bio: String
},
Actors: [String],
ImagePath: String,
Featured: Boolean
});
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, reuired: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});
let actorSchema = mongoose.Schema({
    Actorname: {type:String, required: true},
    Bio: {type: String, required: true}
});
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
module.exports.Movie = Movie;
module.exports.User = User;


