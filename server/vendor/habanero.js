var when = require("when");
var request = require('request');

function doHabaneroLogin() {
    return when.promise(function(resolve, reject) {
		request({
			url: 'https://' + process.env.HABANERO_DOMAIN + '/auth/token',
			method: 'POST',
			form: {
			  client_id: "node-red-editor",
			  grant_type: "password",
			  scope:"",
			  username: process.env.XIVELY_ACCOUNT_USER_NAME,
			  password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
			  accountId: process.env.XIVELY_ACCOUNT_ID,
			  appId: process.env.XIVELY_APP_ID,
			  accessToken: process.env.XIVELY_APP_TOKEN
			}
		},
		function(err,httpResponse,body){ 
			if(err){
				reject(err);
			}
			if (response.statusCode != 200) { 
			    console.log("Error provisioning habanero domain: "+process.evn.HABANERO_DOMAIN );
			    console.log(JSON.stringify(response));
			}
		  	resolve(body);
		});
    });
}

function login(req, res){
	doHabaneroLogin().then(function(loginResult){
		var ticket = new Buffer(loginResult).toString('base64');
		var loginUrl = 'https://' + process.env.HABANERO_DOMAIN +"/enableSession?ticket="+ticket;
		res.redirect(loginUrl);
	});

}

module.exports = {
	login: login
};