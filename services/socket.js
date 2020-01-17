/**
 * Socket.io wrapper
 * Write all events and rooms here
 *
 * https://socket.io/docs/
 */

'use strict';

// ENV variables
const { NODE_ENV } = process.env;

// require third-party node modules

// the rooms for sockets
const SOCKET_ROOMS = {
  GLOBAL: 'GLOBAL', // a global room
  ROOM: 'ROOM-' // add dash here so you can append a unique number for the room

  // add more socket rooms here
};

// the events the socket can emit
const SOCKET_EVENTS = {
  ADMIN_CREATED: 'ADMIN_CREATED',
  USER_CREATED: 'USER_CREATED'

  // add more socket events here
};

module.exports = {
  connect,

  // constant variables
  SOCKET_ROOMS,
  SOCKET_EVENTS
};

/**
 * Creates a new database with a dynamically generated name
 */
function connect(socket) {
  console.log('Client ' + socket.id + ' Connected');

  // join the global room for application
  if (socket.handshake.query.global) socket.join(`${SOCKET_ROOMS.GLOBAL}`);

  // join the correct room for a feature
  if (socket.handshake.query.room) socket.join(`${SOCKET_ROOMS.ROOM}${socket.handshake.query.room}`);

  // add more rooms here

  socket.on('disconnect', () => {
    console.log('Client ' + socket.id + ' Disconnected');
  });
}
