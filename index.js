const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const mongoose = require('mongoose');
const passport = require('passport');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

mongoose.connect('mongodb://localhost:27017/myFLixDB', { useNewUrlParser: true, useUnifiedTopology: true });


//CREATE 

//Create users
app.post('/users', (req, res) => {
	let hashedPassword = Users.hashPassword(req.body.Password);
	Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
	  .then((user) => {
		if (user) {
		//If the user is found, send a response that it already exists
		  return res.status(400).send(req.body.Username + ' already exists');
		} else {
		  Users
			.create({
			  Username: req.body.Username,
			  Password: hashedPassword,
			  Email: req.body.Email,
			  Birthday: req.body.Birthday
			})
			.then((user) => { res.status(201).json(user) })
			.catch((error) => {
			  console.error(error);
			  res.status(500).send('Error: ' + error);
			});
		}
	  })
	  .catch((error) => {
		console.error(error);
		res.status(500).send('Error: ' + error);
	  });
  });

//create users favorite movie
app.post(
	"/users/:Username/movies/:MovieID",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
		  $push: { FavoriteMovies: req.params.MovieID },
		},
		{ new: true }, // This line makes sure that the updated document is returned
		(err, updatedUser) => {
		  if (err) {
			console.error(err);
			res.status(500).send("Error: " + err);
		  } else {
			res.json(updatedUser);
		  }
		}
	  );
	}
  );

//READ
// Get all users
app.get(
	"/users",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Users.find()
		.then((users) => {
		  res.status(201).json(users);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("Error: " + error);
		});
	}
  );

// Get a user by username
app.get(
	"/users/:Username",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Users.findOne({ Username: req.params.Username })
		.then((user) => {
		  res.json(user);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("Error: " + error);
		});
	}
  );
//Get all movies
app.get(
	"/movies", passport.authenticate("jwt", { session: false }), (req, res) => {
	Movies.find()
	  .then((movies) => {
		res.status(201).json(movies);
	  })
	  .catch((error) => {
		console.error(error);
		res.status(500).send("Error: " + error);
	  });
  });


// Get movies by title

app.get(
	"/movies/:Title",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Movies.findOne({ Title: req.params.Title })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send("Error: " + "No such movie!");
		});
	}
  );
//Get genre information


app.get(
	"/movies/genre/:Name",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Movies.find({ "Genre.Name": req.params.Name })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send("Error: " + "No such genre!");
		});
	}
  );

//Get director information
app.get(
	"/movies/director/:Name",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Movies.findOne({ "Director.Name": req.params.Name })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send("Error: " + "No such director!");
		});
	}
  );
//UPDATE

//Update user information

app.put(
	"/users/:Username",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  let errors = validationResult(req);
  
	  if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	  }
  
	  let hashedPassword = Users.hashPassword(req.body.Password);
	  Users.findOne({ Username: req.body.Username })
		.then((user) => {
		  if (user) {
			return res.status(400).send(req.body.Username + " already exists");
		  } else {
			Users.create({
			  Username: req.body.Username,
			  Password: hashedPassword,
			  Email: req.body.Email,
			  Birthday: req.body.Birthday,
			})
			  .then((user) => {
				res.status(201).json(user);
			  })
			  .catch((error) => {
				console.error(error);
				res.status(500).send("Error: " + error);
			  });
		  }
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("Error: " + error);
		});
	}
  );



//Update movie in user's list
app.put(
	"/users/:Username/movies/:MovieID",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
		  $push: { FavoriteMovies: req.params.MovieID },
		},
		{ new: true },
		(err, updatedUser) => {
		  if (err) {
			console.error(err);
			res.status(500).send("Error: " + error);
		  } else {
			res.json(updatedUser);
		  }
		}
	  );
	}
  );

//DELETE

//Delete user
app.delete(
	"/users/:Username",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Users.findOneAndRemove({ Username: req.params.Username })
		.then((user) => {
		  if (!user) {
			res.status(400).send(req.params.Username + " was not found");
		  } else {
			res.status(200).send(req.params.Username + " was deleted.");
		  }
		})
		.catch((err) => {
		  console.error(error);
		  res.status(500).send("Error: " + error);
		});
	}
  );

//
app.delete(
	"/users/:Username/movies/:MovieID",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Movies.findOneAndRemove({ FavoriteMovies: req.params.MovieID })
		.then((movie) => {
		  if (!movie) {
			res.status(400).send(req.params.MovieID + " was not found");
		  } else {
			res.status(200).send(req.params.MovieID + " was deleted.");
		  }
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("Error: " + error);
		});
	}
  );

// error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('An error was encountered!');
});


  app.listen(8080,() => console.log('listen on 8080'))

