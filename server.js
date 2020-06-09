'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})

app.get('/location', (request, response) => {
  const search_query = request.query.city;
  const key = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${search_query}&format=json`;
  superagent.get(url)
    .then(superAgentResults => {
      let returnObj = new Location(search_query, superAgentResults.body[0]);
      response.status(200).send(returnObj);
    }).catch(err => error(err, response));
})

app.get('/weather', (request, response) => {
  try {
    const getWeather = require('./data/weather.json');
    const returnObj = getWeather.data.map(day => new Weather(day));
    response.status(200).send(returnObj);
  }
  catch (err) {
    error(err, response);
  }
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

// 500 error message
function error(err, response) {
  console.log('ERROR', err);
  response.status(500).send('Hmmm, something isn\'t working');
}

// 404 error message
app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})
