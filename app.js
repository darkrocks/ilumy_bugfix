var users = require("./users.js");

var async = require('async');
var nodemailer = require('nodemailer');

const PARALLEL_EXECUTION_LIMIT = 10;

var transporter = nodemailer.createTransport({
  // TODO: populate config here
  host: '',
  port: 465,
  auth: {
    user: '',
    pass: ''
  }
});

// Improvement: replace eachSeries to eachLimit.
// It will be faster to send email in parallel.
// But also we need some reasonable limit to not overload servers
async.eachLimit(users, PARALLEL_EXECUTION_LIMIT, function(user, nextUser) {
  async.auto({
    // Fix: some typos here: buildMail -> createMail email -> to
    createMail: function(cb) {
      cb(null, {
        to: user.email,
        from: 'info@ilumy.com',
        subject: 'testmail',
        text: 'testmail'
      });
    },
    sendMail: ['createMail', function(cb, r) {
      if(r.createMail.to) {
        console.log('Sending mail', r.createMail.to);
        transporter.sendMail(r.createMail, cb);
      }
    }]
  }, nextUser);
}, function(err) {
  // Improvement: add error handling here
  if (err) {
    return console.error(JSON.stringify(err));
  }
  console.log("All users imported")
})
