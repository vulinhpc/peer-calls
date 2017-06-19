jest.mock('simple-peer')
jest.mock('../../window.js')
jest.mock('../../socket.js')

import * as SocketActions from '../SocketActions.js'
import * as constants from '../../constants.js'
import Peer from 'simple-peer'
import socket from '../../socket.js'
import { createStore } from '../../store.js'

describe('SocketActions', () => {
  const roomName = 'bla'

  let store
  beforeEach(() => {
    socket.id = 'a'
    socket.connected = true

    store = createStore()

    Peer.instances = []
  })

  afterEach(() => {
    socket.removeAllListeners()
  })

  const getLastNotification = (index = 1) => {
    const { notifications } = store.getState()
    const keys = Object.keys(notifications)
    return notifications[keys[keys.length - index]]
  }

  describe('handshake', () => {
    describe('connect', () => {
      it('dispatches connected notification when already connected', () => {
        return store.dispatch(SocketActions.handshake({ socket, roomName }))
        .then(() => {
          const notification = getLastNotification(2)
          expect(notification && notification.message)
          .toEqual('Connected to server socket')
        })
      })

      it('waits for connected event when not connected', done => {
        socket.connected = false
        store.dispatch(SocketActions.handshake({ socket, roomName }))
        .then(() => {
          const notification = getLastNotification(2)
          expect(notification && notification.message)
          .toEqual('Connected to server socket')
        })
        .then(done)
        .catch(done.fail)

        socket.connected = true
        socket.emit(constants.SOCKET_CONNECT)
      })
    })

    describe('users', () => {
      beforeEach(() => {
        return store.dispatch(SocketActions.handshake({ socket, roomName }))
        .then(() => {
          const payload = {
            users: [{ id: 'a' }, { id: 'b' }],
            initiator: 'a'
          }
          socket.emit('users', payload)
          expect(Peer.instances.length).toBe(1)
        })
      })

      it('adds a peer for each new user and destroys peers for missing', () => {
        const payload = {
          users: [{ id: 'a' }, { id: 'c' }],
          initiator: 'c'
        }
        socket.emit(constants.SOCKET_EVENT_USERS, payload)

        // then
        expect(Peer.instances.length).toBe(2)
        expect(Peer.instances[0].destroy.mock.calls.length).toBe(1)
        expect(Peer.instances[1].destroy.mock.calls.length).toBe(0)
      })
    })

    describe('signal', () => {
      let data
      beforeEach(() => {
        data = {}
        return store.dispatch(SocketActions.handshake({ socket, roomName }))
        .then(() => {
          socket.emit('users', {
            initiator: 'a',
            users: [{ id: 'a' }, { id: 'b' }]
          })
        })
      })

      it('should forward signal to peer', () => {
        socket.emit('signal', {
          userId: 'b',
          data
        })

        expect(Peer.instances.length).toBe(1)
        expect(Peer.instances[0].signal.mock.calls.length).toBe(1)
      })

      it('does nothing if no peer', () => {
        socket.emit('signal', {
          userId: 'a',
          data
        })

        expect(Peer.instances.length).toBe(1)
        expect(Peer.instances[0].signal.mock.calls.length).toBe(0)
      })
    })
  })

  describe('peer events', () => {
    let peer
    beforeEach(() => {
      let ready = false
      socket.once('ready', () => { ready = true })

      return store.dispatch(SocketActions.handshake({ socket, roomName }))
      .then(() => {
        socket.emit('users', {
          initiator: 'a',
          users: [{ id: 'a' }, { id: 'b' }]
        })
        expect(Peer.instances.length).toBe(1)
        peer = Peer.instances[0]

        expect(ready).toBeDefined()
      })
    })

    describe('error', () => {
      it('destroys peer', () => {
        peer.emit(constants.PEER_EVENT_ERROR, new Error('bla'))
        expect(peer.destroy.mock.calls.length).toBe(1)
      })
    })

    describe('disconnect', () => {
      it('dispatches notification', () => {
        socket.emit(constants.SOCKET_DISCONNECT)
        const notification = getLastNotification()
        expect(notification && notification.message).toEqual(
          'Server socket disconnected'
        )
      })
    })

    describe('signal', () => {
      it('emits socket signal with user id', done => {
        let signal = { bla: 'bla' }

        socket.once('signal', payload => {
          expect(payload.userId).toEqual('b')
          expect(payload.signal).toBe(signal)
          done()
        })

        peer.emit('signal', signal)
      })
    })

    describe('stream', () => {
      it('adds a stream to streamStore', () => {
        const stream = {}
        peer.emit(constants.PEER_EVENT_STREAM, stream)

        expect(store.getState().streams).toEqual({
          b: {
            mediaStream: stream,
            url: jasmine.any(String)
          }
        })
      })
    })

    describe('close', () => {
      beforeEach(() => {
        const stream = {}
        peer.emit(constants.PEER_EVENT_STREAM, stream)
        expect(store.getState().streams).toEqual({
          b: {
            mediaStream: stream,
            url: jasmine.any(String)
          }
        })
      })

      it('removes stream & peer from store', () => {
        expect(store.getState().peers).toEqual({ b: peer })
        peer.emit('close')
        expect(store.getState().streams).toEqual({})
        expect(store.getState().peers).toEqual({})
      })
    })
  })
})
