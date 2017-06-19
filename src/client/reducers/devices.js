import * as constants from '../constants.js'
import Immutable from 'seamless-immutable'
import _ from 'underscore'

const defaultInputs = Immutable({
  videoinput: [{
    deviceId: 'default',
    kind: 'audioinput',
    label: 'Default'
  }],
  audioinput: [{
    deviceId: 'default',
    kind: 'videoinput',
    label: 'Default'
  }]
})
const defaultState = Immutable({
  available: defaultInputs,
  constraints: {
    video: true,
    audio: true
  }
})

const hasAny = array => array && array.length

export default function devices (state = defaultState, action) {
  switch (action && action.type) {
    case constants.DEVICES_FULFILLED:
      const grouped = _.groupBy(action.payload, 'type')
      let { videoinput, audioinput, other } = grouped
      videoinput = hasAny(videoinput) ? videoinput : defaultInputs.videoinput
      audioinput = hasAny(audioinput) ? audioinput : defaultInputs.audioinput
      return state.merge({
        available: {
          videoinput: videoinput,
          audioinput: audioinput,
          ...other
        },
        constraints: {
          video: {
            deviceId: videoinput[0].deviceId
          },
          audio: {
            deviceId: audioinput[0].deviceId
          }
        }
      })
    case constants.DEVICES_AUDIO_SET:
      if (!action.payload.deviceId) {
        return state.setIn(['constraints', 'audio'], false)
      }
      return state.setIn(
        ['constraints', 'audio', 'deviceId'],
        action.payload.deviceId
      )
    case constants.DEVICES_VIDEO_SET:
      if (!action.payload.deviceId) {
        return state.setIn(['constraints', 'video'], false)
      }
      return state.setIn(
        ['constraints', 'video', 'deviceId'],
        action.payload.deviceId
      )
    default:
      return state
  }
}
