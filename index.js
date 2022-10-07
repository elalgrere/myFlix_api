const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

mongoose.connect('mongodb://localhost:27017/myFLixDB', { useNewUrlParser: true, useUnifiedTopology: true });

//CREATE
app.get('/',(req, res) => {
	res.send('Welcome to myFlix app!');
});
app.post('/users',
[
  check('Name', 'Nname is requiered.').isLength({ min: 5 }),
  check('Name', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required.').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  // evaluate validations
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
	return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
	.then((user) => {
	  if(user) {
		return res.status(400).send(req.body.Username + ' already exists');
	  } else {
		Users.create({
		  Username: req.body.Username,
		  Password: hashedPassword,
		  Email: req.body.Email,
		  Birthday: req.body.Birthday
		})
		.then((user) => { res.status(201).json(user) })
		.catch((err) => {
		  console.error(err);
		  res.status(500).send('Error: ' + err);
		})
	  }
	})
	.catch((err) => {
	  console.error(err);
	  res.status(500).send('Error: ' + err);
	});
});
//READ
// Get all users
app.get('/users',
	passport.authenticate('jwt', { session: false }),
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
app.get('/users/:Name', passport.authenticate('jwt', { session: false }),
	(req, res) => {
	  Users.findOne({ Name: req.params.Username })
		.then((user) => {
		  res.json(user);
		})
		.catch((err) => {
		  console.error(err);
		  res.status(500).send('Error: ' + err);
		});
	}
  );

//Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find()
	  .then((movies) => {
		res.status(201).json(movies);
	  })
	  .catch((error) => {
		console.error(error);
		res.status(500).send('Error: ' + error);
	  });
  });


// Get movies by title

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
	(req, res) => {
	  Movies.findOne({ Title: req.params.Title })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send('Error: ' + 'No such movie!');
		});
	}
  );

  //Get movies by genre information


app.get('/movies/genres/:Genre', passport.authenticate('jwt', { session: false }),
(req, res) => {
  Movies.find({ 'Genre.Name': req.params.Genre })
	.then((movies) => {
	  res.json(movies);
	})
	.catch((error) => {
	  console.error(error);
	  res.status(400).send('Error: ' + 'No such genre!');
	});
}
);

//Get genre description

app.get('/genres/:Genre', passport.authenticate('jwt', { session: false }),
(req, res) => {
  Movies.find({ 'Genre.Name': req.params.Genre })
	.then((movie) => {
	  res.send(movie.Genre.Description);
	})
	.catch((err) => {
	  console.error(err);
	  res.status(400).send('Error: ' + 'No such genre!');
	});
}
);

//Get director information
app.get('/movies/director/:Name',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
	  Movies.findOne({ 'Director.Name': req.params.Name })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send('Error: ' + 'No such director!');
		});
	}
  );

//UPDATE	
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
