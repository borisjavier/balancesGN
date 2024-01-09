const functions = require("firebase-functions");
const firebase = require('firebase-admin');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const serviceAccount = require('./assets/serviceAccountKey.json');
const engines = require('consolidate');
const dts = require('./balance');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = firebase.credential.cert(serviceAccount);
//adminConfig.databaseURL = "https://goldennotes-app.firebaseio.com/";

const firebaseApp = firebase.initializeApp(
  adminConfig
);

const app = express();

const instance1 = hbs.create(); //added
app.engine('hbs', engines.handlebars);
app.engine('html', instance1.__express);//added
app.set('views', './views');
app.set('view engine', 'hbs');
app.use('/assets',express.static(__dirname +'/assets'));
app.use('/',express.static(__dirname)); 


app.post('/app', async (req, res) => { 
  const postBody = req.body;
 
    const cuenta = postBody.saldo;
    const bal = await dts.bal(cuenta);
    res.render('bala', { saldo: bal.bal, address: bal.address });
})

exports.app = functions
.runWith({ memory: "1GB", timeoutSeconds: 300 })
.https.onRequest(app); 
