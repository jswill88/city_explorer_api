'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express(0);
app.use(cors());

const PORT = process.env.PORT || 3001;

app.listen(PORT,() => {
  console.log(`listening on ${PORT}`);
})

app.get('/location', (request,response) =>{
  try {
    console.log('inlocation')
    let search_query = request.query.city;
    let geoData = require('./data/location.json');
    let returnObj = new Location(search_query,geoData[0]);
    response.status(200).send(returnObj);
  }
  catch(err) {
    console.log('ERROR', err);
    response.status(500).send('Hmmm, something isn\'t working');
  }
})

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}


app.get('*',(request,response) => {
  response.status(404).send('sorry, this route does not exist');
})
