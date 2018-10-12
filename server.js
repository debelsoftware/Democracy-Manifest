const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const rateLimit = require("express-rate-limit");
const app = express();
app.use(bodyParser.json());

const options = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
};

const password = "database130899";

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 1,
  message: {"status":"fail","data": "limit reached"}
});

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: password,
  multipleStatements: true
});
con.connect(function(err) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("connected to database");
  }
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/status', getStatus);
app.get('/data', getAllData);
app.get('/top3', getTop3);
app.use("/post/", apiLimiter);
app.post('/singledata', getData);
app.post('/post/population', postPop);
app.post('/post/wealth', postWealth);

function validate(data){
  if (data == "" || data == null || data.length > 35){
    return false;
  }
  else {
    return true;
  }
}

async function getStatus(req, res, next) {
  try {
    res.json({"status":"running"});
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

async function getAllData(req, res, next) {
  try {
    con.query("SELECT * FROM `country`.`country`", function (err, result) {
      if (err){
        console.log("ERROR FETCHING DATA");
      }
      else {
        res.json({"data": result});
      }
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

async function getTop3(req, res, next) {
  try {
    con.query("SELECT * FROM `country`.`country` ORDER BY wealth DESC LIMIT 3" , function (err, result) {
      if (err){
        console.log("ERROR FETCHING DATA");
      }
      else {
        res.json({"data": result});
      }
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

async function getData(req, res, next) {
  try {
    con.query("SELECT * FROM `country`.`country` WHERE code = '"+req.body.country+"'", function (err, result) {
      if (err){
        console.log("ERROR FETCHING DATA");
      }
      else if (result[0]) {
        res.json({"data": result});
      }
      else {
        res.sendStatus(500);
      }
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

async function postPop(req, res, next){
  console.log("post");
  if (req.body.modifier == "1"){
    try {
      con.query("UPDATE `country`.`country` SET population = population + 1 WHERE code = '"+req.body.country+"'", function (err, result) {
        if (err){
          console.log(new Date().toLocaleString(),"SQL ERROR AT POPULATION <0");
          res.sendStatus(500);
        }
        else if (result.affectedRows == 0){
          res.sendStatus(500);
        }
        else {
          res.json({"status":"updated"});
        }
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
      console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
    }
  }
  else if (req.body.modifier == "0") {
    try {
      con.query("UPDATE `country`.`country` SET population = population - 1 WHERE code = '"+req.body.country+"'", function (err, result) {
        if (err){
          console.log(new Date().toLocaleString(),"SQL ERROR AT POPULATION <0");
          res.sendStatus(500);
        }
        else if (result.affectedRows == 0){
          res.sendStatus(500);
        }
        else {
          res.json({"status":"updated"});
        }
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
      console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
    }
  }
  else {
    res.sendStatus(500);
    console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
  }
}

async function postWealth(req, res, next){
  console.log("post");
  if (req.body.modifier == "1"){
    try {
      con.query("UPDATE `country`.`country` SET wealth = wealth + 0.01 WHERE code = '"+req.body.country+"'", function (err, result) {
        if (err){
          console.log(new Date().toLocaleString(),"SQL ERROR AT WEALTH");
          res.sendStatus(500);
        }
        else if (result.affectedRows == 0){
          res.sendStatus(500);
        }
        else {
          res.json({"status":"updated"});
        }
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
      console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
    }
  }
  else if (req.body.modifier == "0") {
    try {
      con.query("UPDATE `country`.`country` SET wealth = wealth - 0.01 WHERE code = '"+req.body.country+"'", function (err, result) {
        if (err){
          console.log(new Date().toLocaleString(),"SQL ERROR AT WEALTH");
          res.sendStatus(500);
        }
        else if (result.affectedRows == 0){
          res.sendStatus(500);
        }
        else {
          res.json({"status":"updated"});
        }
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
      console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
    }
  }
  else {
    res.sendStatus(500);
    console.log(new Date().toLocaleString(),"Actually, uhh, i think you'll find that, uh, that's just wrong because i would be right in this situation.");
  }
}

//NON REQUEST BASED FUNCTIONS

async function checkSymbols(text){
  let format = /^[a-zA-Z0-9- ,_]*$/;
  return format.test(text);
}

app.listen(8080);
https.createServer(options, app).listen(8443);
console.log('API running on port 8080');
