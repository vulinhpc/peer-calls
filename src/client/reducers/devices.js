import * as constants from '../constants.js'
import Immutable from 'seamless-immutable'
import _ from 'underscore'

const defaultState = Immutable({
  available: {
    videoinput: {},
    audioinput: {}
  },
  constraints: {
    video: true,
    audio: true
  }
})

function getConstraint (payload) {
  if (payload === 'true') return true
  if (payload === 'false') return false
  return { deviceId: payload }
}

export default function devices (state = defaultState, action) {
  switch (action && action.type) {
    case constants.DEVICES_FULFILLED:
      const grouped = _.groupBy(action.payload, 'type')
      const { videoinput = [], audioinput = [], ...other } = grouped
      return state.merge({
        available: {
          videoinput: _.indexBy(videoinput, 'deviceId'),
          audioinput: _.indexBy(audioinput, 'deviceId'),
          ...other
        }
      })
    case constants.DEVICES_AUDIO_SET:
      return state.setIn(
        ['constraints', 'audio'],
        getConstraint(action.payload)
      )
    case constants.DEVICES_VIDEO_SET:
      return state.setIn(
        ['constraints', 'video'],
        getConstraint(action.payload)
      )
    default:
      return state
  }
}
