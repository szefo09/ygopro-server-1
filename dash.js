var http = require('http');
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
var url = require('url');
var moment = require('moment');
moment.locale('zh-cn');

var config = require('./dash.json');

//http长连接
var responder;

//输出反馈信息，如有http长连接则输出到http，否则输出到控制台
var sendResponse = function(text) {
	text=""+text;
	if (responder) {
		text=text.replace(/\n/g,"<br>");
		responder.write("data: " + text + "\n\n");
	}
	console.log(text);
}

var runcmd = function(cmd, args, path, endmsg, op) {
	var proc = spawn(cmd, args, { cwd: path, env: process.env });
	proc.stdout.setEncoding('utf8');
	proc.stdout.on('data', function(data) {
		sendResponse(data);
	});
	proc.stderr.setEncoding('utf8');
	proc.stderr.on('data', function(data) {
		sendResponse(data);
	});
	proc.on('close', function (code) {
		if (op) {
			op(code);
		}
		if (endmsg) {
			sendResponse(endmsg);
		}
	});
}

var GitPull = function(msg) {
	if (config.git_db_path) {
		var branch = config.server_branch;
		if (!branch) {
			branch = "master";
		}
		runcmd("git", ["pull", "origin", branch], config.git_db_path, "Finished updating data");
	}
	if (config.ocg_git_db_path) {
		var branch = config.ocg_branch;
		if (!branch) {
			branch = "master";
		}
		runcmd("git", ["pull", "origin", branch], config.ocg_git_db_path, "Finished updating OCG data");
	}
	if (config.client_git_db_path) {
		var branch = config.client_branch;
		if (!branch) {
			branch = "master";
		}
		runcmd("git", ["pull", "origin", branch], config.client_git_db_path, "Finished updating client data");
	}
}
var copyToYGOPRO = function(msg) {
	if (!config.ygopro_path || !config.git_db_path) {
		sendResponse("Permission denied");
		return;
	}
	execSync('rm -rf ' + config.ygopro_path + 'expansions/*' + '');
	execSync('cp -rf "' + config.git_db_path + 'expansions' + '" "' + config.ygopro_path + '"');
	execSync('cp -rf "' + config.git_db_path + 'gframe' + '" "' + config.ygopro_path + '"');
	execSync('cp -rf "' + config.git_db_path + 'ocgcore' + '" "' + config.ygopro_path + '"');
	execSync('cp -rf "' + config.git_db_path + 'lflist.conf' + '" "' + config.ygopro_path + '"');
	sendResponse("Finished copying to YGOPro");
	if (config.ocg_git_db_path) {
		execSync('cp -rf "' + config.ocg_git_db_path + 'expansions' + '" "' + config.ygopro_path + '"');
		execSync('cp -rf "' + config.ocg_git_db_path + 'cards.cdb' + '" "' + config.ygopro_path + '"');
		sendResponse("Finished copying OCG data to YGOPro");
	} else {
		execSync('cp -rf "' + config.git_db_path + 'cards.cdb' + '" "' + config.ygopro_path + '"');
	}
}
var MakePro = function(msg) {
	if (config.ygopro_path && config.enable_compile) {
		execSync('mkdir ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('cp -rf ocgcore ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('cp -rf gframe ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('cp -rf premake ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('cp -rf premake4.lua ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('cp -rf premake5.lua ygopro-temp', { cwd: config.ygopro_path, env: process.env });
		execSync('premake4 gmake', { cwd: config.ygopro_path+"ygopro-temp/", env: process.env });
		sendResponse("Finished pre-making");
		runcmd("make", ["config=release"], config.ygopro_path+"ygopro-temp/build/", "Finished making YGOPro", function (code) {
			sendResponse("Build complete");
			execSync('cp -rf ygopro-temp/bin .', { cwd: config.ygopro_path, env: process.env });
			execSync('cp -rf ygopro-temp/obj .', { cwd: config.ygopro_path, env: process.env });
			execSync('cp -rf ygopro-temp/build .', { cwd: config.ygopro_path, env: process.env });
			execSync('rm -rf ygopro-temp', { cwd: config.ygopro_path, env: process.env });		
		});
	} else {
		sendResponse("Permission denied");
	}
}
var UpdateOCGScripts = function(msg) {
	if (!config.ygopro_path) {
		sendResponse("Permission denied");
		return;
	}
	runcmd("git", ["pull", "origin", "master"], config.ygopro_path+"script/", "Finished updating OCG scripts");
}
var ResetOCGScripts = function(msg) {
	if (!config.ygopro_path) {
		sendResponse("Permission denied");
		return;
	}
	runcmd("git", ["fetch", "origin", "master"], config.ygopro_path+"script/", "Finished fetching OCG scripts", function(code) {
		runcmd("git", ["reset", "--hard", "FETCH_HEAD"], config.ygopro_path+"script/", "Finished resetting OCG scripts");
	});
}
var UpdateExtraScripts = function(msg) {
	if (!config.ygopro_path) {
		sendResponse("Permission denied");
		return;
	}
	if(!config.extra_script_repo) {
		sendResponse("Permission denied");
		return;
	}
	runcmd("git", ["pull", config.extra_script_repo, "master"], config.ygopro_path+"script/", "Finished updating Extra scripts");
}
var PushExtraScripts = function(msg) {
	if (!config.ygopro_path) {
		sendResponse("Permission denied");
		return;
	}
	if(!config.push_script_repo) {
		sendResponse("Permission denied");
		return;
	}
	try {
		execSync('git push '+config.push_script_repo+' master', { cwd: config.ygopro_path+"script/", env: process.env });
    } catch (error) {
        sendResponse("git error: "+error.stdout);
		sendResponse("Failed pushing extra scripts");
		return;
    }	
	sendResponse("Finished pushing extra scripts");
}
var UpdateFilelist = function(msg) {
	if(!config.client_git_db_path) {
		sendResponse("Permission denied");
		return;
	}
	var branch = config.client_branch;
	if (!branch) {
		branch = "master";
	}
	runcmd("git", ["pull", "origin", branch], config.client_git_db_path, "Finished updating File List", function(code) {
		try {
			execSync('mono update.exe -ci', { cwd: config.client_git_db_path+"update/", env: process.env });
		} catch (error) {
			try {
				execSync('update.exe -ci', { cwd: config.client_git_db_path+"update/", env: process.env });
			} catch (error) {
				sendResponse(error);			
				sendResponse("Failed generating File List");
				return;
			}
		}		
		sendResponse("Finished generating File List");		
		if(config.client_push_repo) {
			try {
				execSync('git add . -A', { cwd: config.client_git_db_path, env: process.env });
				execSync('git commit -m Filelist', { cwd: config.client_git_db_path, env: process.env });
				execSync('git push '+config.client_push_repo+' '+branch, { cwd: config.client_git_db_path, env: process.env });
			} catch (error) {
				sendResponse("git error: "+error.stdout);
				sendResponse("Failed pushing File List");
				return;
			}
			sendResponse("Finished pushing File List");
		}		
	});	
}
var ZipData = function(msg) {
	if(!config.client_git_db_path || !config.zip_path) {
		sendResponse("Permission denied");
		return;
	}
	execSync('rm -rf '+config.zip_path);
	runcmd("7z", ["a", "-mx9", "-xr!.git*", config.zip_path, "./*"], config.client_git_db_path, "Finish zipping data");	
}
var StartServer = function(msg) {
	if (config.pm2_name) {
		runcmd("pm2", ["restart", config.pm2_name], ".", "Server Started");
	} else {
		sendResponse("Permission denied");
	}
}
var StopServer = function(msg) {
	if (config.pm2_name) {
		runcmd("pm2", ["stop", config.pm2_name], ".", "Server Stopped");
	} else {
		sendResponse("Permission denied");
	}
}
var RunCommand = function(msg) {
	if (config.enable_command) {
		var cmd = msg.split('||')
		if (cmd[0]) {
			var args = [];
			var i = 1;
			while (cmd[i]) {
				args[i-1] = cmd[i];
				i = i + 1;
			}
			runcmd(cmd[0], args, config.ygopro_path, "Finshed Running Command");
		}
	} else {
		sendResponse("Permission denied");
	}
}
var pt=config.port;
http.createServer(function (req, res) {
	var u = url.parse(req.url, true);
	
	if (u.query.password !== config.password) {
		res.writeHead(403);
		res.end("Auth Failed.");
		return;
	}
	
	if (u.pathname === '/api/msg') {
		res.writeHead(200, {
			"Access-Control-Allow-origin": "*",
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive"
		});
		
		res.on("close", function(){
			responder = null;
		});
		
		responder = res;
		
		sendResponse("Connected");
	}
	else if (u.pathname === '/api/git_pull') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Started updating data"});');
		GitPull(u.query.message);
	}
	else if (u.pathname === '/api/copy_to_ygopro') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Started copying to YGOPro"});');
		copyToYGOPRO(u.query.message);
	}
	else if (u.pathname === '/api/make_ygopro') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Started making YGOPro"});');
		MakePro(u.query.message);
	}
	else if (u.pathname === '/api/update_ocg_scripts') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Updating OCG scripts"});');
		UpdateOCGScripts(u.query.message);
	}
	else if (u.pathname === '/api/reset_scripts') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Resetting OCG scripts"});');
		ResetOCGScripts(u.query.message);
	}
	else if (u.pathname === '/api/update_extra_scripts') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Updating extra scripts"});');
		UpdateExtraScripts(u.query.message);
	}
	else if (u.pathname === '/api/push_extra_scripts') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Pushing extra scripts"});');
		PushExtraScripts(u.query.message);
	}
	else if (u.pathname === '/api/zip_data') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Started zipping data"});');
		ZipData(u.query.message);
	}
	else if (u.pathname === '/api/update_filelist') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Started updating File List"});');
		UpdateFilelist(u.query.message);
	}
	else if (u.pathname === '/api/start_server') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Starting server"});');
		StartServer(u.query.message);
	}
	else if (u.pathname === '/api/stop_server') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Stopping Server"});');
		StopServer(u.query.message);
	}
	else if (u.pathname === '/api/run_command') {
		res.writeHead(200);
		res.end(u.query.callback+'({"message":"Running Command"});');
		RunCommand(u.query.message);
	}
	else {
		res.writeHead(400);
		res.end("400");
	}

}).listen(pt);

