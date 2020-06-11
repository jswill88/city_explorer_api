'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// })

app.get('/location', (request, response) => {
  const city = request.query.city;

  let checkForCity = 'SELECT * FROM city WHERE search_query = $1;';
  let safeValue = [city];
  client.query(checkForCity, safeValue)
    .then(callback => {
      if (callback.rowCount) {
        console.log('checking database');
        response.status(200).send(callback.rows[0]);
      } else {
        const key = process.env.GEOCODE_API_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        superagent.get(url)
          .then(superAgentResults => {
            let returnObj = new Location(city, superAgentResults.body[0]);
            console.log('checking superagent');

            let sqlQuery = 'INSERT INTO city (search_query, formatted_query,latitude, longitude) VALUES ($1, $2, $3, $4);';
            let safeValue = [returnObj.search_query, returnObj.formatted_query, returnObj.latitude, returnObj.longitude];
            client.query(sqlQuery, safeValue).catch(err => console.log(err));

            response.status(200).send(returnObj);

          }).catch(err => error(err, response));
      }
    })
})


app.get('/weather', (request, response) => {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
  superagent.get(url)
    .then(results => {
      const returnObj = results.body.data.map(day => new Weather(day));
      response.status(200).send(returnObj);
    }).catch(err => error(err, response));
})

app.get('/trails', (request, response) => {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const key = process.env.TRAIL_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
  superagent.get(url)
    .then(results => {
      const returnObj = results.body.trails.map(trail => new Trail(trail));
      response.status(200).send(returnObj);
    }).catch(err => error(err, response));
})




function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = (new Date(obj.conditionDate)).toLocaleDateString();
  this.condition_time = (new Date(obj.conditionDate)).toLocaleTimeString();
}

// 500 error message
function error(err, response) {
  console.log('ERROR', err);
  response.status(500).send('Hmmm, something isn\'t working');
}

// 404 error message
app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })
