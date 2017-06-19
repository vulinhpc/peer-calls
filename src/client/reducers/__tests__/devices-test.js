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
          audioinput: [{
            deviceId: 'one',
            type: 'audioinput'
          }, {
            deviceId: 'two',
            type: 'audioinput'
          }],
          videoinput: [{
            deviceId: 'three',
            type: 'videoinput'
          }]
        })
        expect(devices.constraints).toEqual({
          audio: {
            deviceId: 'one'
          },
          video: {
            deviceId: 'three'
          }
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
          audio: {
            deviceId: 'default'
          },
          video: {
            deviceId: 'default'
          }
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
    it('sets audio to false when no value', () => {
      store.dispatch(CallActions.setAudioDevice(null))
      const { devices } = store.getState()
      expect(devices.constraints.audio).toBe(false)
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
    it('sets video to false when no value', () => {
      store.dispatch(CallActions.setVideoDevice(null))
      const { devices } = store.getState()
      expect(devices.constraints.video).toBe(false)
    })
  })

})
