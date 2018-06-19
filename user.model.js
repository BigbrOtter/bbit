const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  bsn: Number,
  naam: String,
  private: String,
  public: String,
  cert: String
})

module.exports = mongoose.model('User', userSchema)
