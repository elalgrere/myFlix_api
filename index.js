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

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


//CREATE 

app.post('/users', (req, res) => {
	Users.findOne({ Username: req.body.Username })
	  .then((user) => {
		if (user) {
		  return res.status(400).send(req.body.Username + 'already exists');
		} else {
		  Users
			.create({
			  Username: req.body.Username,
			  Password: req.body.Password,
			  Email: req.body.Email,
			  Birthday: req.body.Birthday
			})
			.then((user) =>{res.status(201).json(user) })
		  .catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		  })
		}
	  })
	  .catch((error) => {
		console.error(error);
		res.status(500).send('Error: ' + error);
	  });
  });
//Get users

app.get('/users', (req, res) => {
	Users.find()
	  .then((users) => {
		res.status(201).json(users);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
// Get a user by username

app.get('/users/:Username', (req, res) => {
	Users.findOne({ Username: req.params.Username })
	  .then((user) => {
		res.json(user);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
//Get all movies
app.get('/movies', (req, res) => {
	Users.find()
	  .then((movies) => {
		res.status(201).json(movies);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
  //Get movies by title
  app.get('/movies/:Moviename', (req, res) => {
	Users.findOne({ Moviename: req.params.Moviename })
	  .then((movie) => {
		res.json(movie);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });


//Get genre by name


app.get(
	"/movies/genre/:Name", (req, res) => {
	  Movies.find({ "Genre.Name": req.params.Genrename })
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
	"/movies/director/:Name", (req, res) => {
	  Movies.find({ "Director.Name": req.params.Directorname })
		.then((movie) => {
		  res.json(movie);
		})
		.catch((error) => {
		  console.error(error);
		  res.status(400).send("Error: " + "No such genre!");
		});
	}
  );
//UPDATE

//Update user information


app.put('/users/:Username', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
	  {
		Username: req.body.Username,
		Password: req.body.Password,
		Email: req.body.Email,
		Birthday: req.body.Birthday
	  }
	},
	{ new: true }, 
	(err, updatedUser) => {
	  if(err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  } else {
		res.json(updatedUser);
	  }
	});
  });

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
	   $push: { FavoriteMovies: req.params.MovieID }
	 },
	 { new: true }, // This line makes sure that the updated document is returned
	(err, updatedUser) => {
	  if (err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  } else {
		res.json(updatedUser);
	  }
	});
  });

//DELETE

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
	Users.findOneAndRemove({ Username: req.params.Username })
	  .then((user) => {
		if (!user) {
		  res.status(400).send(req.params.Username + ' was not found');
		} else {
		  res.status(200).send(req.params.Username + ' was deleted.');
		}
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });

//Delete favorite movie
app.delete(
	"/users/:Username/movies/:MovieID", (req, res) => {
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

app.listen(8080,() => console.log('listen on 8080'));







