// Generated by CoffeeScript 1.12.7
(function() {
  var WebSocketServer, _delete, broadcast, create, init, room_data, server, settings, start, update, url;

  WebSocketServer = require('ws').Server;

  url = require('url');

  settings = global.settings;

  server = null;

  room_data = function(room) {
    var client;
    return {
      id: room.name,
      title: room.title,
      user: {
        username: room.username
      },
      users: (function() {
        var i, len, ref, results;
        ref = room.players;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          client = ref[i];
          var push_data = {
            username: client.name,
            position: client.pos
          },
          if (settings.modules.http.show_ip) {
            push_data.username = client.name + " (" + client.ip + ")";
          }
          results.push(push_data);
        }
        return results;
      })(),
      options: room.hostinfo,
      arena: settings.modules.arena_mode.enabled && room.arena && settings.modules.arena_mode.mode
    };
  };

  init = function(http_server, ROOM_all) {
    server = new WebSocketServer({
      server: http_server
    });
    return server.on('connection', function(connection) {
      var room;
      connection.filter = url.parse(connection.upgradeReq.url, true).query.filter || 'waiting';
      return connection.send(JSON.stringify({
        event: 'init',
        data: (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = ROOM_all.length; i < len; i++) {
            room = ROOM_all[i];
            if (room && room.established && (connection.filter === 'started' || !room["private"]) && (room.started === (connection.filter === 'started'))) {
              results.push(room_data(room));
            }
          }
          return results;
        })()
      }));
    });
  };

  create = function(room) {
    if (!room["private"]) {
      return broadcast('create', room_data(room), 'waiting');
    }
  };

  update = function(room) {
    if (!room["private"]) {
      return broadcast('update', room_data(room), 'waiting');
    }
  };

  start = function(room) {
    if (!room["private"]) {
      broadcast('delete', room_data(room), 'waiting');
    }
    return broadcast('create', room_data(room), 'started');
  };

  _delete = function(room) {
    if (room.started) {
      return broadcast('delete', room.name, 'started');
    } else {
      if (!room["private"]) {
        return broadcast('delete', room.name, 'waiting');
      }
    }
  };

  broadcast = function(event, data, filter) {
    var connection, i, len, message, ref, results;
    if (!server) {
      return;
    }
    message = JSON.stringify({
      event: event,
      data: data
    });
    ref = server.clients;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      connection = ref[i];
      if (connection.filter === filter) {
        try {
          results.push(connection.send(message));
        } catch (error) {}
      }
    }
    return results;
  };

  module.exports = {
    init: init,
    create: create,
    update: update,
    start: start,
    "delete": _delete
  };

}).call(this);
