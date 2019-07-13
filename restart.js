var moment = require('moment');
var exec = require('child_process').exec;
var check = function () {
	var now = moment();
	if (now.hour() % 4 == 0 && now.minute() == 20) {
		console.log("UPDATE!");
		exec("./update.sh");
		setTimeout(check, 120000);
	} else if (now.hour() == 5 && now.minute() == 35) {
		exec('./updateygopro.sh');
		console.log("YGOPro Upgrade!");
		setTimeout(check, 120000);
	} else {
		if (now.hour() == 5 && now.minute() == 45) {
			var date = moment().format("DD_MM_YY").toString();
			var optionsConfig = {
				cwd: "/home/pi/server/ygopro-server/config",
				env: process.env
			}
			var optionsMain = {
				cwd: "/home/pi/server/ygopro-server",
				env: process.env
			}
			exec(`zip -qr /home/ftpuser/backup/replays/replays_${date}.zip replays`, optionsMain).on('exit', () => {
				exec(`zip -qr /media/pi/usb/replays/replays_${date}.zip replays`, optionsMain).on('exit', () => {
					exec("rm -rf replays/*", optionsMain)
					console.log(`backup replays${date}`);
					exec(`zip -qr /home/ftpuser/backup/decks_saves/decks_save_${date}.zip decks_save`, optionsMain).on("exit", () => {
						exec(`zip -qr /media/pi/usb/deckssaves/decks_save_${date}.zip decks_save`, optionsMain).on('exit', () => {
							exec("rm -rf decks_save/*", optionsMain);
							console.log(`backup decks_save${date}`);
							exec(`zip -qr /home/ftpuser/backup/duel_logs/duel_log${date}.zip duel_log.json`, optionsConfig).on('exit', () => {
								exec(`cp duel_log.json /media/pi/usb/duel_logs/duel_log${date}.json`, optionsConfig).on('exit', () => {
									exec("rm -rf duel_log.json", optionsConfig).on('exit', () => {
										console.log(`backup duel_log${date}.json`);
										console.log("restart server.");
										exec("sudo pm2 restart all");
									});

								});
							});
						});

					});
				});
			});
		} else {
			//console.log(now.format());
			setTimeout(check, 10000);
		}
	}

}
setTimeout(check, 60000);