jest.mock('../../socket.js')
jest.mock('../../window.js')
jest.mock('../../store.js')
jest.mock('../SocketActions.js')

import * as CallActions from '../CallActions.js'
import * as SocketActions from '../SocketActions.js'
import * as constants from '../../constants.js'
import Promise from 'bluebird'
import store from '../../store.js'
import { callId, getUserMedia } from '../../window.js'

describe('reducers/alerts', () => {

  beforeEach(() => {
    store.clearActions()
    getUserMedia.fail(false)
    SocketActions.handshake.mockReturnValue(
      jest.fn().mockReturnValue(Promise.resolve())
    )
  })

  describe('init', () => {

    it('calls handshake.init when connected & got camera stream', () => {
      const promise = store.dispatch(CallActions.init())
      expect(store.getActions()).toEqual([{
        type: constants.INIT_PENDING
      }])
      return promise.then(() => {
        expect(SocketActions.handshake.mock.calls).toEqual([[{
          roomName: callId,
          stream: getUserMedia.stream
        }]])
      })
    })

    it('dispatches alert when failed to get media stream', () => {
      getUserMedia.fail(true)
      const promise = store.dispatch(CallActions.init())
      return promise.then(result => {
        expect(result.value).toBe(null)
        expect(store.getActions()).toEqual([{
          type: 'INIT_PENDING'
        }, {
          payload: {
            action: '',
            dismissable: false,
            message: 'Could not get access to microphone & camera',
            type: 'warning'
          },
          type: constants.ALERT
        }, {
          type: 'INIT_FULFILLED'
        }])
      })
    })

  })

})
