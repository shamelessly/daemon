var twit = require('twit');
var monk = require('monk');
var Model = require('./model');
var accounts = require('./account');
var template = require('./tweets_template');
var _ = require('lodash');

var tweets = [];
var users = [];

function sendTweet(text, idstr){
  app.twclient.post('statuses/update', {status : text, in_reply_to_status_id: idstr}, function(err){
    if(err){
      console.log(require('util').inspect(err, true, 10, true));
    }
  });
}

var app = {
  model : new Model(),

  init: function(cb){
    if(!app.model.ready){
      return setTimeout(function(){
        app.init(cb);
      }, 100);
    }
    app.twclient = new twit({
      consumer_key: 't4jGhlS0GGUfXsHENh1rDg',
      consumer_secret: '90iswA8ZXPm5snXks1J9x34Gq9zot0qGwtWv1c8CCs',
      access_token: '2333915352-RFAMKRURCYm2HjY1FOjv2BB6p5qeoRC4xb0yZ6D',
      access_token_secret: 'T1SukUJx0YyHeMXg6LFirEL0jklI0CYCPx20KECO1qsyJ'
    });
    setTimeout(cb, 1);
  },

  getList : function(){
    console.log('get list...');
    app.twclient.get('friends/ids', function(err, result){
      app.twclient.get('users/lookup', {user_id : result.ids.join(',')}, function(err, result){
        result.forEach(function(item){
          console.log('"@' + item.screen_name + '",');
        });
      });
    });
  },

  start: function(){
    console.log('Start listening...');

    var stream = app.twclient.stream('statuses/filter', { track: accounts.join(','), language: 'en, fr, us' });

    stream.on('tweet', function (tweet) {
      var index = tweets.push(tweet);
      console.log(index-1, 'followers:', tweet.user.followers_count, 'friends',tweet.user.friends_count, tweet.user.screen_name, tweet.text);
    });

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
     
    process.stdin.on('data', function (chunk) {
      var index = tweets.length-1;
      if(chunk && chunk !== null && chunk !== ""){
        index = parseInt(chunk, 10);
      }
      if(index === null || index < 0 || index >= tweets.length){
        return;
      }
      var tweet = tweets[index];
      if(!tweet){
        return;
      }
      app.model.saveTweet(tweets[index], function(err, result){
        var brand = [];
        tweet.entities.hashtags.forEach(function(h){
          if(h.text.toLowerCase() === 'swmontreal' && users.indexOf(tweet.user.screen_name) === -1) {
            users.push(tweet.user.screen_name);
            return setTimeout(function(){
              sendTweet("Hey, @"+tweet.user.screen_name+", so good to hear what you had to say about #SWMontreal. Check out what we did with it!" , tweet.id_str);
            }, 6000);
          }
        });
        tweet.entities.user_mentions.forEach(function(m){
          accounts.forEach(function(a){
            if(a.substring(1).toLowerCase() == m.screen_name.toLowerCase()){
              brand.push(a);
            }
          });
        });
        if(brand.length){
          var text = _(template).shuffle().at(0).value().toString();
          text = text.replace('[customer]', tweet.user.screen_name);
          text = text.replace('[brand]', brand[0]);
          setTimeout(function(){
            sendTweet(text, tweet.id_str);
          }, 6000);
        }
      });
    });
  },
  stop: function(){}
};

app.init(app.start);
// app.init(app.getList);
