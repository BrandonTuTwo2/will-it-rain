'use strict'


//nominatim


const express = require("express");
const app     = express();
const path    = require("path");
const axios = require("axios");


// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const portNum = process.env.PORT || 1234;

//sends html page
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

//sends css styles
app.get('/style.css',function(req,res){
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

//sends front end js
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

app.get('/getAddressData', function(req,res){
  let url = "https://nominatim.openstreetmap.org/search?q=";
  let address = req.query.address
  console.log(address);
  let urlEnd = "&format=json";
  let addressData = {};
  axios.get(url + address + urlEnd)
    .then(result =>{
      addressData = result.data;
      console.log(addressData);
      res.send(addressData);
    })
    .catch(error => {
      console.log(error);
      res.send({error});
    })
});


//let url = "http://www.7timer.info/bin/api.pl?lon=113.17&lat=23.09&product=meteo&output=json";
app.get('/getForcast',function(req,res){
  let url = "http://www.7timer.info/bin/api.pl?lon="
  let latitude = req.query.lat;
  let longitude = req.query.lon;
  let forcast = {};
  axios.get(url + longitude + "&lat=" + latitude + "&product=civil&output=json")
  .then(result =>{
    forcast = result.data;
    console.log(result.data);
    res.send(forcast);
  })
  .catch(error => {
    console.log(error);
    res.send({error});
  })
});

/*let url = "https://nominatim.openstreetmap.org/search?q=9 Hewitt Lane&format=json";
axios.get(url)
  .then(result =>{
    //addressData = result.data;
    console.log(result.data);
    //res.send(addressData);
  })
  .catch(error => {
    console.log(error);
    //res.send({error});
  })*/

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);
