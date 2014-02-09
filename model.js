var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var format = require('util').format;
var db_host = "127.0.0.1";

function Model(){
  this.ready = false;
  this.db = null;
  this.init();
}

Model.prototype.init = function() {
  var self = this;
  Db.connect(format("mongodb://%s:%s/shmly?w=1", db_host , Connection.DEFAULT_PORT),function(err,db){
    if(err){
      console.log('Error connectin DB... TRY AGAIN');
      return setTimeout(self.init, 1);
    }
    self.db = db;
    self.ready = true;
  });
};

Model.prototype.saveTweet = function(tweet, cb){
  var col = this.db.collection('tweets');
  col.insert(tweet,cb);
};

module.exports = Model;