const express = require('express');
const request = require('request');
const xmlParser = require('xml2js').parseString;
const dateFormat = require('dateformat');

const router = express.Router();

const getCbrApiUrl = () =>
  `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${dateFormat(Date.now(), 'dd/mm/yyyy')}`;

const getQRCodeSrc = (data, size) =>
  `http://api.qrserver.com/v1/create-qr-code/?data=${data}&size=${size}x${size}`;

const makeRequest = url =>
  new Promise((resolve, reject) =>
    request.get(url, (err, res, body) =>
      resolve(body)));

const getUsdRate = () =>
  makeRequest(getCbrApiUrl())
    .then(response => new Promise((resolve, reject) =>
      xmlParser(response, (error, result) =>
        resolve(result.ValCurs.Valute))))
        
    .then(course => course.filter(valute => valute.CharCode[0] === 'USD')[0].Value[0]);


router.get('/', (req, res, next) => {
  getUsdRate()
    .then((usdRate) => {
      const usdRateInfo = `Курс доллара: ${usdRate} RUB`;
      res.render('index', {
        hasReader: true,
        QRCode: getQRCodeSrc(usdRateInfo, 200),
      });
    });
});

router.get('/no-reader', (req, res, next) => {
  getUsdRate()
    .then(usdRate =>
      res.render('index', {
        hasReader: false,
        usdRate,
      }));
});

module.exports = router;
