const Run = require('./run/dist/run.node.min.js'); //require('run-sdk');
const firebase = require('firebase-admin');

const serviceAccount = require('./assets/serviceAccountKey.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = firebase.credential.cert(serviceAccount);

const firebaseApp = firebase.initializeApp(
    adminConfig, "firestoreApp"
);

const db = firebaseApp.firestore();
const convert = (from, to) => str => Buffer.from(str, from).toString(to)
const hexToUtf8 = convert('hex', 'ascii');

class Firestore {
    async get(key) {
      // Firestore does not allow forward slashes in keys
      key = key.split('://').join('-');
      console.log(key); 
      let data;
      const entry = await db.collection('state').doc(key).get();
      if (entry.exists) {
        data = entry.data();
        if (data.hasOwnProperty('hex')) {
          return data.hex;
        }
      }//
      return data; 
    }
  
    async set(key, value) {
        // Firestore does not allow forward slashes in keys
        key = key.replace(/:\/\/+/g, '-');
        /*let theVal = isHashOrHex(value);
        
        let theV = {
          hex: value
        };
        //console.log('key_bal: ', key);
        console.log('value_bal: ', theVal);
        const hexArray = theVal.map(item => item.hex);*/
        let theVal;

        switch (isHashOrHex(value)) {
          case 0:
            theVal = {
              hex: value
            };
            break;
          case 1:
            theVal = {
              hex: value
            };
            break;
          case 2:
            theVal = value;
            break;
          default:
            theVal = value;
            break;
        }
        console.log('value_bal: ', theVal);
        return db.collection('state').doc(key).set(theVal);
      
    }
  }

async function bal(llp) {
    
    let blockchain = new Run.plugins.WhatsOnChain({ network: 'main', apiKey: 'mainnet_6c81a97a917bdab017bb02cd0d98f794' });      
      const userRun = new Run({ purse: "L2FLdLwbF3kyfAGhvMzV3y7mtxYtMAradjJqnSXHSKsqTofoKycT", owner: llp, trust: ['a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48', '3ba617b9adf0ad3730d05c5a0bc10442182917823865e7c7e4a613a70ab14089'],  blockchain, cache: new Firestore(), api: 'whatsonchain', networkTimeout: 20000, networkRetries: 5 })
   
    
    try {
      userRun.activate()
      const smartNoteClassLocation = 'a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48_o1'
      const SmartNote = await userRun.load(smartNoteClassLocation)       
      await userRun.inventory.sync()
  
      const coins = await userRun.inventory.jigs.filter(jig => jig instanceof SmartNote)
      
      await userRun.sync()
      let balance = 0
      coins.forEach(coin => { balance += coin.amount })
      console.log('Coins es: ', JSON.stringify(coins));

      const add = userRun.owner.address.toString()
      console.log('Balance: ', balance)
      const diet = {address: add, bal: balance};
      return diet;
      }
      catch (error) {        
          console.log('Error detectado: ', error.message);
          console.log('Stack trace: ', error.stack);
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
    return 2;
  }
}

    module.exports = {
        bal
    }
        
