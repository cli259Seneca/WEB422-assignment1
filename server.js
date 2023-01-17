/**************************************************************************** */
// Setup
/**************************************************************************** */
const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();
//setup date base
const MoviesDB = require("./modules/moviesDB.js")
const db = new MoviesDB();
process.env.MONGODB_CONN_STRING = "mongodb+srv://me:abc12345678@cluster0.nnjgzdj.mongodb.net/sample_mflix?retryWrites=true&w=majority"
//app and port
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
//support incoming JSON entities
app.use(express.json());
app.use(cors());

/**************************************************************************** */
//API
/**************************************************************************** */
//home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

//add a new movie document to collection of MongoDB
app.post("/api/movies", (req, res)=>{
    db.addNewMovie(req.body)
    .then((mov) => {
        res.status(201).json(mov);
    })
    .catch(() => {
        res.status(500).json({message: "Fail to add new movie"});
    });
})

//accept parameters: page, perPage, title(optional)
//ie: /api/movies?page=1&perPage=5&title=The Avengers
//return all Movies filtering by title to the client 
app.get("/api/movies", (req, res)=>{
    db.getAllMovies(req.query.page, req.query.perPage, req.query.title)
    .then((mov) => {
        res.json(mov);
    })
    .catch((err) => {
        res.json(err);
    });
})

//return the specific movie of the given id
//ie: /api/movies/573a1391f29313caabcd956e
app.get("/api/movies/:_id", (req, res)=>{
    db.getMovieById(req.params._id)
    .then((mov) => {
        res.json(mov)
    })
    .catch(()=>{
        res.json({message: `Fail to load movie ${req.params._id}`});
    });
})

//update the specific movie of the given id
//ie: /api/movies/573a1391f29313caabcd956e
app.put("/api/movies/:_id", (req, res)=>{
    db.updateMovieById(req.body, req.params._id)
    .then((mov) => {
        res.json({message: `Movie updates successfully!`})
    })
    .catch(()=>{
        res.json({message: `Fail to update movie ${req.params._id}`});
    });
})

//detele the specific movie of the given id
//ie: /api/movies/573a1391f29313caabcd956e
app.delete("/api/movies/:_id", (req, res)=>{
    db.deleteMovieById(req.params._id)
    .then(((mov)=>{
        res.status(201).json({message: `Movie is deleted`})
    }))
    .catch(()=>{
        res.status(500).json({message: `Fail to delete movie ${req.params._id}`});
    });
})

//for unknown request
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

//listening for requests with init the data base
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});



