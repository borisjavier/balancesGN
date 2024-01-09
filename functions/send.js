const Run = require('./run/dist/run.node.min.js'); //require('run-sdk');
const bsv = require('bsv')
const crypto = require('crypto');
const firebase = require('firebase-admin');
const btoa = require('btoa');
const fetch = require("node-fetch");


const serviceAccount = require('./assets/serviceAccountKey.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = firebase.credential.cert(serviceAccount);

const firebaseApp = firebase.initializeApp(
    adminConfig, "firestoreApp1"
);

const db = firebaseApp.firestore();

class Firestore {
    async get(key) {
      // Firestore does not allow forward slashes in keys
      key = key.split('://').join('-')
  
      const entry = await db.collection('state').doc(key).get()
  
      if (entry.exists) return entry.data()
    }
  
    async set(key, value) {
        // Firestore does not allow forward slashes in keys
      /*key = key.split('://').join('-');
      let theVal;   
      if (isHashOrHex(value) == 1)
      {theVal = value}
      else if(isHashOrHex(value) == 0)
      {const unfiletered = Buffer.from(value, 'hex').toString('utf8');
      const filteredValue = unfiletered.replace(/[^\x20-\x7E]+/g, '');
      theVal = JSON.parse(filteredValue);
      console.log('theVal: ', theVal);
      }
      console.log('key_bal: ', key)
      console.log('value_bal: ', value);
      return db.collection('state').doc(key).set(theVal)*/

        // Firestore does not allow forward slashes in keys
        key = key.replace(/:\/\/+/g, '-');
        let theVal;
      
        if (isHashOrHex(value) === 1) {
          theVal = value;
        } else if (isHashOrHex(value) === 0) {
          try {
            const unfiltered = Buffer.from(value, 'hex').toString('utf8');
            const filteredValue = unfiltered.replace(/[^\x20-\x7E]+/g, '');
            const extractedJSON = extractValidJSON(filteredValue);
            console.log('Extracted parsed JSON: ',JSON.parse(extractedJSON));
            theVal = extractedJSON;
          } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
          }
        } else {
          theVal = value;
          return;
        }
      
        console.log('key_bal: ', key);
        console.log('value_bal: ', theVal);
        
        return db.collection('state').doc(key).set(theVal);
      }
  }



async function txn(addr, amou, own) {
    const duc = await trend(own);
    
    const userRun = new Run({ purse: "L2FLdLwbF3kyfAGhvMzV3y7mtxYtMAradjJqnSXHSKsqTofoKycT", owner: duc, trust: 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48', blockchain, cache: new Firestore(), networkTimeout: 20000, networkRetries: 5 })//, cache: new Firestore()
    //const codeTxId = '8af0b749a9373d8c6da2013310685bfa7c6048acde852e01a05aa1d329a6cab1';
    //userRun.trust(codeTxId)
    //userRun.trust('c89bcf57c11197cd98fb097ade03134dc49144c5d3b413daabbab8e7a348d243')
    //userRun.trust('e7d0777932bd64ed6522b07f76607edf0525349e68e58f8a38544d98f159b95f')
    //c89bcf57c11197cd98fb097ade03134dc49144c5d3b413daabbab8e7a348d243_o1
    //api: 'whatsonchain', 
    
    userRun.activate()
    await userRun.sync()
    const smartNoteClassLocation = 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1';  
    const SmartNote = await userRun.load(smartNoteClassLocation) 
    await userRun.inventory.sync()
    await SmartNote.sync()  
    const coins = await userRun.inventory.jigs.filter(jig => jig instanceof SmartNote)        

    let am =  Math.round(amou * 10000);
    const amy = parseInt(am);    
    const mpk = '025b404ec58109b430512ac0cb00b3c937ac2f96ca4735d6d5d0ea9c307c5ad22e';//owner pubkey
    let balance = 0;
    coins.forEach(coin => { balance += coin.amount })
    if (balance > (amy + 2)) {
        try {               
            const tx = new Run.Transaction()
                console.log(JSON.stringify(coins))
                tx.update(() => coins[0].combine(...coins.slice(1)))
            tx.update(() => coins[0].send(addr, amy)) 
            tx.update(() => coins[0].send(mpk,2))              
            const r = await tx.export();
            const complete = bsv.Transaction(r);
            const isSigned = complete.isFullySigned();
            const txid = userRun.blockchain.broadcast(r)           
            await userRun.sync();            
            return txid;
        }
        catch (error) {
            console.log('ERROR DE EJECUCIÓN: ', error.message);
            //blockchain = new Run.plugins.MatterCloud({ network: 'main' }); //await switchNetwork(false);
            blockchain = new Run.plugins.WhatsOnChain({ network: 'main', apiKey: 'mainnet_070620529ad27d5b08372b1a3a6b273a' });
            const userRun = new Run({ purse: "L2FLdLwbF3kyfAGhvMzV3y7mtxYtMAradjJqnSXHSKsqTofoKycT", owner: duc, trust: 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48', blockchain, cache: new Firestore(), networkTimeout: 20000, networkRetries: 5 })//cache: new Firestore(), api: 'whatsonchain', 
            userRun.activate()
            await userRun.sync()            
            const SmartNote = await userRun.load(smartNoteClassLocation) 
            await userRun.inventory.sync()
            await SmartNote.sync()  
            const coins = await userRun.inventory.jigs.filter(jig => jig instanceof SmartNote)        
                        
                const tx = new Run.Transaction()
                
                tx.update(() => coins[0].combine(...coins.slice(1)))
                tx.update(() => coins[0].send(addr, amy)) 
                tx.update(() => coins[0].send(mpk,2))
                
                const txid = await tx.publish()            
                await userRun.sync()                
                return txid;           
        }
    }
    else {
        let message = 'No hay balance suficiente';
        return message; 
      }
    }

  
function isHashOrHex(str) {
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    const hexRegex = /^[a-fA-F0-9]+$/;
  
    if (hashRegex.test(str)) {
      return 1;
    } else if (hexRegex.test(str)) {
      return 0;
    } else {
      return "No es un hash ni un texto hexadecimal válido";
    }
  }

  function extractValidJSON(text) {
    const startIndex = text.indexOf('run');
    const braceIndex = text.indexOf('{', startIndex);
  
    if (braceIndex !== -1) {
      const endIndex = text.lastIndexOf('}');
      if (endIndex > braceIndex) {
        const jsonString = text.substring(braceIndex, endIndex + 1).replace(/'/g, '"');
        return jsonString;
      }
    }
  
    return '';
  }

    module.exports = {
        txn
    }
        
