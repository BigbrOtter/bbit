const NodeRSA = require('node-rsa')
const fs = require('fs')
const rimraf = require('rimraf')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const args = process.argv.slice(2)
const User = require('./user.model')

// Mongoose
const connectMongoDB = () => {
  const DBUSER = process.env.DBUSER
  const DBPASS = process.env.DBPASS
  const DBHOST = process.env.DBHOST
  const DBPORT = process.env.DBPORT
  const DBNAME = process.env.DBNAME

  mongoose.connect(`mongodb://${DBUSER}:${DBPASS}@${DBHOST}:${DBPORT}/${DBNAME}`).then(() => {
    // console.log(`MongoDB successfully connected to: '${DBHOST}:${DBPORT}/${DBNAME}', ${new Date()}`)
  }).catch((error) => {
    console.log(`MongoDB connection error to: '${DBHOST}:${DBPORT}/${DBNAME}', ${error.message}, ${new Date()}`)
  })
}

// Functions
const generateServerKeys = () => {
  const keys = generateRSAKeys()
  fs.writeFileSync(`out/private.pem`, keys.private)
  fs.writeFileSync(`out/public.pem`, keys.public)
  process.exit()
}

const cleanOutDir = () => {
  rimraf('out', () => {})
  fs.mkdirSync('out')
  process.exit()
}

const registerCustomer = () => {
  if (fs.existsSync('out/private.pem') === false) {
    console.log('No server private key.')
    process.exit()
  }
  connectMongoDB()
  const keys = generateRSAKeys()
  const serverPrivateKey = fs.readFileSync('out/private.pem', {encoding: 'utf-8'})
  const serverPublicKey = fs.readFileSync('out/public.pem', {encoding: 'utf-8'})
  const userCertificate = createCertificate(keys.public, serverPrivateKey)
  const newUser = new User({
    bsn: args[1],
    naam: args[4] ? `${args[2]} ${args[3]} ${args[4]}` : `${args[2]} ${args[3]}`,
    private: keys.private,
    public: keys.public,
    cert: userCertificate
  })
  newUser.save((error) => {
    if (error) throw error
    console.log(`Saved user to the MongoDB`)
    fs.writeFileSync(`out/${args[1]}.circle`, JSON.stringify({
      userPrivateKey: keys.private,
      serverPublicKey: serverPublicKey,
      userCertificate: userCertificate
    }))
    process.exit()
  })
}

const checkCertficiate = () => {
  if (fs.existsSync('out/public.pem') === false) {
    console.log('No server public key.')
    process.exit()
  }
  const serverPublicKey = new NodeRSA(fs.readFileSync('out/public.pem', {encoding: 'utf-8'}))
  try{
    const userPublicKey = serverPublicKey.decryptPublic(args[1], 'utf-8')
    console.log('Certificate is valid!')
  }
  catch (error) {
    console.error('Certificate is invalid!')
  }
}

// Helper functions
const createCertificate = (userPublicKey, serverPrivateKey) => {
  const privateKey = new NodeRSA(serverPrivateKey)
  return privateKey.encryptPrivate(userPublicKey, 'base64')
}

const generateRSAKeys = () => {
  const key = new NodeRSA().generateKeyPair()
  const publicKey = key.exportKey('pkcs1-public-pem')
  const privateKey = key.exportKey('pkcs1-private-pem')
  return {public: publicKey, private: privateKey}
}

// Logic switch
switch(args[0]){
  case 'genServerKeys':
    generateServerKeys() // node .
    break
  case 'cleanOutDir':
    cleanOutDir() // node .
    break
  case 'registerCustomer':
    registerCustomer() // node . bsn voornaam tussenvoegsel achternaam || node . bsn voornaam achternaam
    break
  case 'verifySignature':
    checkCertficiate() // node . verifySignature CERT
    break
  default:
    console.error(`Argument '${args[0]}' is not recognized.`)
    process.exit()
    break
}
