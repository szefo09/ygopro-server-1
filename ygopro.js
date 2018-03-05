// Generated by CoffeeScript 1.12.7
(function() {
  var Struct, _, declaration, field, i, i18ns, len, loadJSON, name, result, structs_declaration, type, typedefs;

  _ = require('underscore');

  _.str = require('underscore.string');

  _.mixin(_.str.exports());

  Struct = require('./struct.js').Struct;

  loadJSON = require('load-json-file').sync;

  i18ns = loadJSON('./data/i18n.json');

  structs_declaration = loadJSON('./data/structs.json');

  typedefs = loadJSON('./data/typedefs.json');

  this.proto_structs = loadJSON('./data/proto_structs.json');

  this.constants = loadJSON('./data/constants.json');

  this.structs = {};

  for (name in structs_declaration) {
    declaration = structs_declaration[name];
    result = Struct();
    for (i = 0, len = declaration.length; i < len; i++) {
      field = declaration[i];
      if (field.encoding) {
        switch (field.encoding) {
          case "UTF-16LE":
            result.chars(field.name, field.length * 2, field.encoding);
            break;
          default:
            throw "unsupported encoding: " + field.encoding;
        }
      } else {
        type = field.type;
        if (typedefs[type]) {
          type = typedefs[type];
        }
        if (field.length) {
          result.array(field.name, field.length, type);
        } else {
          if (this.structs[type]) {
            result.struct(field.name, this.structs[type]);
          } else {
            result[type](field.name);
          }
        }
      }
    }
    this.structs[name] = result;
  }

  this.stoc_follows = {};

  this.ctos_follows = {};

  this.stoc_follow = function(proto, synchronous, callback) {
    var key, ref, value;
    if (typeof proto === 'string') {
      ref = this.constants.STOC;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.STOC[proto]) {
        throw "unknown proto";
      }
    }
    this.stoc_follows[proto] = {
      callback: callback,
      synchronous: synchronous
    };
  };

  this.ctos_follow = function(proto, synchronous, callback) {
    var key, ref, value;
    if (typeof proto === 'string') {
      ref = this.constants.CTOS;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.CTOS[proto]) {
        throw "unknown proto";
      }
    }
    this.ctos_follows[proto] = {
      callback: callback,
      synchronous: synchronous
    };
  };

  this.stoc_send = function(socket, proto, info) {
    var buffer, header, key, ref, struct, value;
    if (typeof info === 'undefined') {
      buffer = "";
    } else if (Buffer.isBuffer(info)) {
      buffer = info;
    } else {
      struct = this.structs[this.proto_structs.STOC[proto]];
      struct.allocate();
      struct.set(info);
      buffer = struct.buffer();
    }
    if (typeof proto === 'string') {
      ref = this.constants.STOC;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.STOC[proto]) {
        throw "unknown proto";
      }
    }
    header = new Buffer(3);
    header.writeUInt16LE(buffer.length + 1, 0);
    header.writeUInt8(proto, 2);
    socket.write(header);
    if (buffer.length) {
      socket.write(buffer);
    }
  };

  this.ctos_send = function(socket, proto, info) {
    var buffer, header, key, ref, struct, value;
    if (typeof info === 'undefined') {
      buffer = "";
    } else if (Buffer.isBuffer(info)) {
      buffer = info;
    } else {
      struct = this.structs[this.proto_structs.CTOS[proto]];
      struct.allocate();
      struct.set(info);
      buffer = struct.buffer();
    }
    if (typeof proto === 'string') {
      ref = this.constants.CTOS;
      for (key in ref) {
        value = ref[key];
        if (value === proto) {
          proto = key;
          break;
        }
      }
      if (!this.constants.CTOS[proto]) {
        throw "unknown proto";
      }
    }
    header = new Buffer(3);
    header.writeUInt16LE(buffer.length + 1, 0);
    header.writeUInt8(proto, 2);
    socket.write(header);
    if (buffer.length) {
      socket.write(buffer);
    }
  };

  this.stoc_send_chat = function(client, msg, player) {
    var j, len1, line, o, r, re, ref, ref1;
    if (player == null) {
      player = 8;
    }
    if (!client) {
      console.log("err stoc_send_chat");
      return;
    }
    ref = _.lines(msg);
    for (j = 0, len1 = ref.length; j < len1; j++) {
      line = ref[j];
      if (player >= 10) {
        line = "[Server]: " + line;
      }
      ref1 = i18ns[client.lang];
      for (o in ref1) {
        r = ref1[o];
        re = new RegExp("\\$\\{" + o + "\\}", 'g');
        line = line.replace(re, r);
      }
      this.stoc_send(client, 'CHAT', {
        player: player,
        msg: line
      });
    }
  };

  this.stoc_send_chat_to_room = function(room, msg, player) {
    var client, j, k, len1, len2, ref, ref1;
    if (player == null) {
      player = 8;
    }
    if (!room) {
      console.log("err stoc_send_chat_to_room");
      return;
    }
    ref = room.players;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      client = ref[j];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
    ref1 = room.watchers;
    for (k = 0, len2 = ref1.length; k < len2; k++) {
      client = ref1[k];
      if (client) {
        this.stoc_send_chat(client, msg, player);
      }
    }
  };
  
  this.stoc_send_hint_music = function(client, music, music_type) {
    if (!client) {
      console.log("err stoc_send_hint_music");
      return;
    }
    this.stoc_send(client, 'GAME_MSG', {
      curmsg: 2,
      type: music_type,
      player: 0,
      data: music
    });
  };

  this.stoc_send_hint_music_to_room = function(room, music, music_type) {
    var client, j, k, len1, len2, ref, ref1;
    if (!room) {
      console.log("err stoc_send_hint_music_to_room");
      return;
    }
    ref = room.players;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      client = ref[j];
      if (client) {
        this.stoc_send_hint_music(client, music, music_type);
      }
    }
    ref1 = room.watchers;
    for (k = 0, len2 = ref1.length; k < len2; k++) {
      client = ref1[k];
      if (client) {
        this.stoc_send_hint_music(client, music, music_type);
      }
    }
  };  

  this.stoc_send_hint_music_to_room = function(room, music) {
    var client, j, k, len1, len2, ref, ref1;
    if (!room) {
      console.log("err stoc_send_hint_card_to_room");
      return;
    }
    ref = room.players;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      client = ref[j];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 11,
          player: 0,
          data: music
        });
      }
    }
    ref1 = room.watchers;
    for (k = 0, len2 = ref1.length; k < len2; k++) {
      client = ref1[k];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 11,
          player: 0,
          data: music
        });
      }
    }
  }; 
  
  this.stoc_send_hint_card_to_room = function(room, card) {
    var client, j, k, len1, len2, ref, ref1;
    if (!room) {
      console.log("err stoc_send_hint_card_to_room");
      return;
    }
    ref = room.players;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      client = ref[j];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 10,
          player: 0,
          data: card
        });
      }
    }
    ref1 = room.watchers;
    for (k = 0, len2 = ref1.length; k < len2; k++) {
      client = ref1[k];
      if (client) {
        this.stoc_send(client, 'GAME_MSG', {
          curmsg: 2,
          type: 10,
          player: 0,
          data: card
        });
      }
    }
  };

  this.stoc_die = function(client, msg) {
    this.stoc_send_chat(client, msg, this.constants.COLORS.RED);
    if (client) {
      this.stoc_send(client, 'ERROR_MSG', {
        msg: 1,
        code: 9
      });
    }
    if (client) {
      client.destroy();
    }
  };

}).call(this);
