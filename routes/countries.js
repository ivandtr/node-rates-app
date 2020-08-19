const axios = require('axios');
const express = require('express');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const config = require('../startup/config');

const router = express.Router();

const countriesApi = 'https://restcountries.eu/rest/v2/';
const apiKey = config.get('API_KEY');

router.get('/all', async (req, res) => {
  const { data: allCountries } = await axios.get(`${countriesApi}all`);
  const allCountriesNames = allCountries.map((countryObj) => countryObj.name);
  res.json(allCountriesNames);
});

router.get('/:selected', auth, rateLimit, async (req, res) => {
  const countryName = req.params.selected;
  const { data: countryDetails } = await axios.get(
    `${countriesApi}name/${countryName}?fullText=true`
  );
  const countryCurrencySymbols = countryDetails[0].currencies.map(
    (currencyObj) => currencyObj.code
  );

  const exchangeRates = await Promise.all(
    countryCurrencySymbols.map(async (symbol) => {
      const rateUrl = `http://data.fixer.io/api/latest?access_key=${apiKey}&base=${symbol}&symbols=SEK`;
      const { data: rateData } = await axios.get(rateUrl);
      return rateData;
    })
  );

  ({ name, population, currencies, flag } = countryDetails[0]);

  const data = {
    name,
    population: population,
    currencies,
    flag,
    rateSEK: exchangeRates,
  };

  res.json(data);
});

module.exports = router;
