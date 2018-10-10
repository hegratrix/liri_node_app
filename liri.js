require('dotenv').config()
const request = require('request')
const moment = require('moment')
const inquirer = require('inquirer')
const fs = require('fs')
const keys = require('./keys.js')
const Spotify = require('node-spotify-api')
const spotify = new Spotify(keys.spotify)


runProgram()
function runProgram () {
    inquirer.prompt([
        {
        type: 'list',
        name: 'action',
        message: 'Welcome to Liri!  \nWhat would you like to do?',
        choices: ['Spotify-This-Song', 'Movie-This', 'Concert-This', 'Do-What-It-Says']
        }
    ]).then(function (option) {
        switch (option.action) {
            case "Spotify-This-Song":
                inquirer.prompt([
                    {
                        name: "song",
                        message: "What song?"
                    }
                ]).then(function(answer) {
                    getSong(answer.song)
                })
            break;
            case "Movie-This":
                inquirer.prompt([
                    {
                        name: "movie",
                        message: "What movie?"
                    }
                ]).then(function (answer) {
                    getMovie(answer.movie)
                })
            break;
            case "Concert-This":
                inquirer.prompt([
                    {
                        name: "concert",
                        message: "Which artist/band?"
                    }
                ]).then(function (answer) {
                    getConcert(answer.concert)
                })
            break;
            case "Do-What-It-Says":
            doWhatItSays()
            break;
        }
    })
}    

function getSong (song) {
    let searchSong = song
    let typeSong = 'track'
    if (song === '') {
        searchSong = 'Ace of Base the Sign'
    }
    spotify.search({ type: 'track', query: searchSong, limit: 3}, function(err, data) {
        if (err) {
        return console.log('Error occurred: ' + err)
        }
        let newSong = (`
            ******************************
            Song Name: ${data.tracks.items[0].name}
            Artist(s): ${data.tracks.items[0].artists[0].name}
            Album: ${data.tracks.items[0].album.name}
            Preview Song: ${data.tracks.items[0].preview_url}
            ******************************
            `)
        console.log(newSong)
        fs.appendFile ('log.txt', 'Spotify-this-Song: ' +song+ '\n',  function(err) {
        playAgain()    
            if (err) {
            return console.log(err)
            }
        })
    })
}

function getMovie (movie) {
    let searchMovie = movie
    if (movie === '') {
        searchMovie= 'Mr. Nobody'
    }
    request(`http://www.omdbapi.com/?t=${searchMovie}&y=&plot=short&apikey=trilogy`, function(error, response, body) {
        if (error) {
            console.log(error)
        }
        let newMovie = (`
            ******************************
            Movie: ${JSON.parse(body).Title}
            Year: ${JSON.parse(body).Year}
            IMDB Rating: ${JSON.parse(body).imdbRating}
            Rotten Tomatoes Rating: ${JSON.parse(body).Ratings[1].Value}
            Country: ${JSON.parse(body).Country}
            Language: ${JSON.parse(body).Language}
            Plot: ${JSON.parse(body).Plot}
            Actors: ${JSON.parse(body).Actors}
            ******************************
        `)
        console.log (newMovie)
        // console.log (JSON.parse(body))
        fs.appendFile ('log.txt', 'Movie-This: ' +movie+ '\n',  function(err) {
        playAgain()
            if (err) {
                return console.log(err)
            }
        })
    })
}

function getConcert (artist) {
    request(`https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`, function(error, response, body) {
        if (error) {
            console.log(error)
        }
        for (let i = 0; i < 3; i++) {
            let date = JSON.parse(body)[i].datetime
            date = moment(date).format('MM/DD/YYYY')
            let newConcert = (`
                ******************************
                Artist/Band: ${JSON.parse(body)[i].lineup}
                Date: ${date}
                City: ${JSON.parse(body)[i].venue.city}
                Venue: ${JSON.parse(body)[i].venue.name}
                ******************************`)
            console.log (newConcert)
        }
        fs.appendFile ('log.txt', 'Concert-This: ' +artist+ '\n',  function(err) {
        playAgain()
            if (err) {
                return console.log(err)
            }
        })
    })
}

function doWhatItSays (){
    console.log('Do what it says')
    fs.readFile ('./random.txt', 'utf8', function (e, data){
        if (e) {console.log(e)}
        else {
            data = data.split(',')
            let action = data[0]
            let entry = data[1]
            switch (action) {
                case "Spotify-This-Song":
                    getSong(entry)
                    break
                case "Movie-This":
                    getMovie(entry)
                    break
                case "Concert-This":
                    getConcert(entry)
                    break
            }
        }
    })
}
    
function playAgain () {
    inquirer.prompt([
        {
            type: 'list',
            name: 'again',
            message: 'Would you like to start over?',
            choices: ['yes', 'no']
        }
    ]).then(function (answer) {
        if (answer.again === 'yes') {
            runProgram()
        } else
            console.log('Good-Bye!')
    })
}