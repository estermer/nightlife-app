const express     = require('express');
const request     = require('request');
const hbs         = require('hbs');
const bodyParser  = require('body-parser');
const app         = express();
const apiURL      = "https://api.yelp.com/v3/businesses/search?term=bar&location=";

require('dotenv').config();

const tokenOptions = { method: 'POST',
  url: 'https://api.yelp.com/oauth2/token',
  qs: {
    grant_type: 'client_credentials',
    client_id: process.env.YELP_ID,
    client_secret: process.env.YELP_SECRET
  }
};

const searchOptions = {
  method: 'GET',
  url: 'https://api.yelp.com/v3/businesses/search',
  qs: {
    term: 'bars',
    location: ''
  },
  headers: {
    authorization: ''
  }
};

/******************EXPRESS CONFIG*****************/
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );    // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({  // to support URL-encoded bodies
  extended: true
}));
/*************************************************/

/******************HANDLEBARS*********************/
app.set('view engine', 'hbs');
app.set('views', './views');
/*************************************************/

app.get('/', (req, res) => {
  request(tokenOptions, function (error, response, body) {
    if (error) throw new Error(error);
    let type = JSON.parse(body).token_type;
    let token = JSON.parse(body).access_token;
    searchOptions.headers.authorization = `${type} ${token}`;
  });
  res.render('home');
});

app.post('/search', (req, res) => {
  searchOptions.qs.location = req.body.search.term;

  request(searchOptions, function (error, response, data) {
    if (error) throw new Error(error);
    let bars = JSON.parse(data).businesses;
    // res.json(JSON.parse(data).businesses);
    res.render('list', {bars: bars});

  });

});

app.listen(process.env.PORT || 3000);
