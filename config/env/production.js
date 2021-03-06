'use strict';

module.exports = {
  //db: 'mongodb://localhost/mean-prod',
  db: 'mongodb://nodejitsu:e0b737c9d532fc27e1e753a25a4f823e@troup.mongohq.com:10001/nodejitsudb3924701379',
  port: 80,
  //mongo troup.mongohq.com:10001/nodejitsudb3924701379 -u nodejitsu -p e0b737c9d532fc27e1e753a25a4f823e
  /**
   * Database options that will be passed directly to mongoose.connect
   * Below are some examples.
   * See http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
   * and http://mongoosejs.com/docs/connections.html for more information
   */
  dbOptions: {
    /*
    server: {
        socketOptions: {
            keepAlive: 1
        },
        poolSize: 5
    },
    replset: {
      rs_name: 'myReplicaSet',
      poolSize: 5
    },
    db: {
      w: 1,
      numberOfRetries: 2
    }
    */
  },
  app: {
    name: 'AskOn'
  },
  facebook: {
    clientID: '1506076563009916',
    clientSecret: 'eba1e517f80f8eb099e6baab0b1bcb57',
    //callbackURL: 'http://askon.nodejitsu.com/auth/facebook/callback'
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  twitter: {
    clientID: 'MCGEgdrqJ3xyKObQW0uFP4ZGW',
    clientSecret: '3xzNsPWcHm4rHvEbLNFye8PTsjEsdm61Pn6vynoQ3Y2eNeDg5C',
    callbackURL: 'http://askon.nodejitsu.com/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  linkedin: {
    clientID: 'API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: 'http://localhost:3000/auth/linkedin/callback'
  },
  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>
  mailer: {
    service: 'SERVICE_PROVIDER',
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  }
};
