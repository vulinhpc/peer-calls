import * as NotifyActions from '../actions/NotifyActions.js'
import * as PeerActions from '../actions/PeerActions.js'
import * as constants from '../constants.js'
import Promise from 'bluebird'
import _ from 'underscore'
import _debug from 'debug'
import socket from '../socket.js'

const debug = _debug('peercalls')

class SocketHandler {
  constructor ({ socket, roomName, stream, dispatch, getState }) {
    this.socket = socket
    this.roomName = roomName
    this.stream = stream
    this.dispatch = dispatch
    this.getState = getState
  }
  handleConnect = () => {
    const { dispatch } = this
    dispatch(NotifyActions.warning('Connected to server socket'))
  }
  handleDisconnect = () => {
    const { dispatch } = this
    dispatch(NotifyActions.error('Server socket disconnected'))
  }
  handleSignal = ({ userId, signal }) => {
    const { getState } = this
    const peer = getState().peers[userId]
    // debug('socket signal, userId: %s, signal: %o', userId, signal);
    if (!peer) return debug('user: %s, no peer found', userId)
    peer.signal(signal)
  }
  handleUsers = ({ initiator, users }) => {
    const { socket, stream, dispatch, getState } = this
    debug('socket users: %o', users)
    dispatch(NotifyActions.info('Connected users: {0}', users.length))
    const { peers } = getState()

    users
    .filter(user => !peers[user.id] && user.id !== socket.id)
    .forEach(user => dispatch(PeerActions.createPeer({
      socket,
      user,
      initiator,
      stream
    })))

    let newUsersMap = _.indexBy(users, 'id')
    _.keys(peers)
    .filter(id => !newUsersMap[id])
    .forEach(id => peers[id].destroy())
  }
}

export function handshake ({ roomName, stream }) {
  return (dispatch, getState) => {
    return connect()
    .then(() => {
      const handler = new SocketHandler({
        socket,
        roomName,
        stream,
        dispatch,
        getState
      })

      // already connected, the listener we're about to add will not handle
      // the first connect - it needs to be triggered manually
      handler.handleConnect()
      socket.on(constants.SOCKET_CONNECT, handler.handleConnect)
      socket.on(constants.SOCKET_DISCONNECT, handler.handleDisconnect)
      socket.on(constants.SOCKET_EVENT_SIGNAL, handler.handleSignal)
      socket.on(constants.SOCKET_EVENT_USERS, handler.handleUsers)

      debug('socket.id: %s', socket.id)
      debug('emit ready for room: %s', roomName)
      dispatch(NotifyActions.info('Ready for connections'))
      socket.emit('ready', roomName)
    })
  }
}

function connect () {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      return resolve()
    }
    socket.once(constants.SOCKET_CONNECT, resolve)
  })
}
