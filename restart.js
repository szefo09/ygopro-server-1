var moment = require('moment');
var exec = require('child_process').exec;
var check = function() {
	var now = moment();
	if (now.hour()%2==0 && now.minute() == 22) {
		console.log("UPDATE!");
		exec("./update.sh");
		setTimeout(check, 120000);		
	}else{	
		if (now.hour()==5&&now.minute()==40){
			console.log("It is time NOW!");
			exec("pm2 restart all");
		}
		else {
			console.log(now.format());
			setTimeout(check, 10000);
	}
	}

}
setTimeout(check, 60000);
