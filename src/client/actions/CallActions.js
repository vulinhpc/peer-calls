import * as NotifyActions from './NotifyActions.js'
import * as SocketActions from './SocketActions.js'
import * as StreamActions from './StreamActions.js'
import * as constants from '../constants.js'
import { callId, getUserMedia } from '../window.js'

export const init = () => dispatch => {
  return dispatch({
    type: constants.INIT,
    payload: getCameraStream()(dispatch)
    .then(stream => {
      return dispatch(SocketActions.handshake({
        roomName: callId,
        stream
      }))
    })
  })
}

export const getCameraStream = () => dispatch => {
  return getUserMedia({ video: true, audio: true })
  .then(stream => {
    dispatch(StreamActions.addStream({ stream, userId: constants.ME }))
    return stream
  })
  .catch(() => {
    dispatch(NotifyActions.alert('Could not get access to microphone & camera'))
    return null
  })
}
