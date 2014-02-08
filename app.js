var twit = require('twit');
var monk = require('monk');



var app = {
  init: function(){
    app.twclient = new twit({
      consumer_key: 'NDLcU6UNBHCvB5CDh1Hew',
      consumer_secret: 'kgViQyCp2uz9zDcOa23ckSLtMkV8cmS7lewDd3MI',
      access_token: '2333897359-UM0ElvXX8muBWkvJxBHJrcF405bTG6b3dk25CPV',
      access_token_secret: '2edaGWqOdmCOrqviLWes2H9U4Rjkjo9enDsz8FMPB6i52'
    });
  },
  start: function(){
    app.init();
    var stream = app.twclient.stream('statuses/filter', { track: '#swmontréal, @cocacola, @Bell', language: 'en' });

    stream.on('tweet', function (tweet) {
      console.log(tweet.text);
    });
  },
  stop: function(){}
};

app.start();