/*
 ygopro-draw.js
 get card usage from decks
 Author: Nanahira
 License: MIT
 
 generate a lflist.conf for drafts.
 the config file is at ./config/draw.json, which should be:
{
  "dbfile": "ygopro/cards.cdb",
  "lflist": "ygopro/lflist.conf",
  "list": "2018.7",
  "main": 600,
  "extra": 300,
  "output": "./lflist.conf"
}

*/
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var loadJSON = require('load-json-file').sync;
var config = loadJSON('./config/draw.json');
var constants = loadJSON('./data/constants.json');

var ALL_MAIN_CARDS={};
var ALL_EXTRA_CARDS={};
var CARD_RESULT={};
var LFLIST={"unknown": []};
var MAIN_POOL=[];
var EXTRA_POOL=[];

function load_database(callback) {
    var db=new sqlite3.Database(config.dbfile);
    db.each("select * from datas,texts where datas.id=texts.id", function (err,result) {
        if (err) {
            console.log(config.dbfile + ":" + err);
            return;
        }
        else {
            if ((result.type & constants.TYPES.TYPE_TOKEN) || result.alias) {
                return;
            }
            CARD_RESULT[result.id] = 0;
            if((result.type & constants.TYPES.TYPE_FUSION) || (result.type & constants.TYPES.TYPE_SYNCHRO) || (result.type & constants.TYPES.TYPE_XYZ) || (result.type & constants.TYPES.TYPE_LINK)) {
                ALL_EXTRA_CARDS[result.id] = 3;
            } else {
                ALL_MAIN_CARDS[result.id] = 3;
            }
        }
    }, callback);
}

function load_lflist() {
    var raw = fs.readFileSync(config.lflist, 'utf8').split(/\n/g);
    var current_list = "unknown";
    for(var i in raw) {
        var line = raw[i];
        if(line.match(/!(.+)/)) {
            current_list = line.match(/!(.+)/)[1];
            if (!LFLIST[current_list]) {
                LFLIST[current_list] = {};
            }
        } else if (line.match(/(\d+) 0/)) {
            LFLIST[current_list][parseInt(line.match(/(\d+) 0/)[1])] = 0;
        } else if (line.match(/(\d+) 1/)) {
            LFLIST[current_list][parseInt(line.match(/(\d+) 1/)[1])] = 1;
        } else if (line.match(/(\d+) 2/)) {
            LFLIST[current_list][parseInt(line.match(/(\d+) 2/)[1])] = 2;
        }
    }
        console.log(LFLIST[config.list]);
    if (LFLIST[config.list]) {
        for(var code in LFLIST[config.list]) {
            count = LFLIST[config.list][code];
            if(ALL_MAIN_CARDS[code] === 3) {
                if (count) {
                    ALL_MAIN_CARDS[code] = count;
                } else {
                    delete ALL_MAIN_CARDS[code];
                };
            } else if (ALL_EXTRA_CARDS[code] === 3) {
                if (count) {
                    ALL_EXTRA_CARDS[code] = count;
                } else {
                    delete ALL_EXTRA_CARDS[code];
                };
            }
        }
    }
    generate_pool();
}

function generate_pool() {
    for (var code in ALL_MAIN_CARDS) {
        var count = ALL_MAIN_CARDS[code];
        for (var i = 0; i < count; ++i) {
            MAIN_POOL.push(code);
        }
    }
    for (var code in ALL_EXTRA_CARDS) {
        var count = ALL_EXTRA_CARDS[code];
        for (var i = 0; i < count; ++i) {
            EXTRA_POOL.push(code);
        }
    }
    pick_cards();
}

function pick_cards() {
    for (var i = 0; i < config.main; ++i) {
        var l = MAIN_POOL.length;
        if (!l) {break;}
        var index = Math.floor(Math.random() * l);
        var code = MAIN_POOL[index];
        CARD_RESULT[code]++;
        MAIN_POOL.splice(index, 1);
    }
    for (var i = 0; i < config.extra; ++i) {
        var l = EXTRA_POOL.length;
        if (!l) {break;}
        var index = Math.floor(Math.random() * l);
        var code = EXTRA_POOL[index];
        CARD_RESULT[code]++;
        EXTRA_POOL.splice(index, 1);
    }
    output();
}
function output() {
    var op = "#[Random]\n\n!Random\n";
    for (var code in CARD_RESULT) {
        op = op + code + " " + CARD_RESULT[code] + "\n";
    }
    fs.writeFile(config.output, op, 'utf-8', function(err) {
        if (err) {
            console.log(err);
        }
    });
}

load_database(load_lflist);