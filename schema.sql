DROP TABLE IF EXISTS city;

CREATE TABLE city (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT
);

SELECT * FROM city;