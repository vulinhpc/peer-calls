jest.mock('../../socket.js')
jest.mock('enumerate-devices')

import * as CallActions from '../../actions/CallActions.js'
import enumerateDevices from 'enumerate-devices'
import { createStore } from '../../store.js'

describe('reducers/devices', () => {

  let store, initialDevices
  beforeEach(() => {
    store = createStore()
    initialDevices = store.getState().devices
  })

  describe('enumerateDevices', () => {
    describe('success', () => {
      beforeEach(() => {
        enumerateDevices.mockReturnValue(
          Promise.resolve([{
            deviceId: 'one',
            type: 'audioinput'
          }, {
            deviceId: 'two',
            type: 'audioinput'
          }, {
            deviceId: 'three',
            type: 'videoinput'
          }])
        )
        return store.dispatch(CallActions.enumerateDevices())
      })
      it('groups devices by type', () => {
        const { devices } = store.getState()
        expect(devices.available).toEqual({
          audioinput: {
            one: {
              deviceId: 'one',
              type: 'audioinput'
            },
            two: {
              deviceId: 'two',
              type: 'audioinput'
            }
          },
          videoinput: {
            three: {
              deviceId: 'three',
              type: 'videoinput'
            }
          }
        })
        expect(devices.constraints).toEqual({
          audio: true,
          video: true
        })
      })
    })
    describe('missing values', () => {
      beforeEach(() => {
        enumerateDevices.mockReturnValue(Promise.resolve([]))
        return store.dispatch(CallActions.enumerateDevices())
      })
      it('uses default values when missing', () => {
        const { devices } = store.getState()
        expect(devices.available).not.toBe(initialDevices.available)
        expect(devices.available).toEqual(initialDevices.available)
        expect(devices.constraints).toEqual({
          audio: true,
          video: true
        })
      })
    })
    describe('failure', () => {
      beforeEach(done => {
        enumerateDevices.mockReturnValue(Promise.reject(new Error('test')))
        store.dispatch(CallActions.enumerateDevices())
        .then(done.fail)
        .catch(err => {
          expect(err.message).toBe('test')
          done()
        })
      })
      it('handles rejected promise', () => {
        const { devices } = store.getState()
        expect(devices).toBe(initialDevices)
      })
    })
  })

  describe('setAudioDevice', () => {
    it('sets selected audio input', () => {
      store.dispatch(CallActions.setAudioDevice('test123'))
      const { devices } = store.getState()
      expect(devices.constraints.audio).toEqual({
        deviceId: 'test123'
      })
    })
    it('sets audio to false when "false"', () => {
      store.dispatch(CallActions.setAudioDevice("false"))
      const { devices } = store.getState()
      expect(devices.constraints.audio).toBe(false)
    })
    it('sets audio to true when "true"', () => {
      store.dispatch(CallActions.setAudioDevice("true"))
      const { devices } = store.getState()
      expect(devices.constraints.audio).toBe(true)
    })
  })

  describe('setVideoDevice', () => {
    it('sets selected video input', () => {
      store.dispatch(CallActions.setVideoDevice('test123'))
      const { devices } = store.getState()
      expect(devices.constraints.video).toEqual({
        deviceId: 'test123'
      })
    })
    it('sets video to false when "false"', () => {
      store.dispatch(CallActions.setVideoDevice('false'))
      const { devices } = store.getState()
      expect(devices.constraints.video).toBe(false)
    })
    it('sets video to true when "true"', () => {
      store.dispatch(CallActions.setVideoDevice('true'))
      const { devices } = store.getState()
      expect(devices.constraints.video).toBe(true)
    })
  })

})
