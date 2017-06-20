import _ from 'underscore'
import PropTypes from 'prop-types'
import React from 'react'

const deviceProp = PropTypes.shape({
  label: PropTypes.string,
  deviceId: PropTypes.string
})

const deviceConstraintProp = PropTypes.oneOf([
  PropTypes.bool,
  PropTypes.string
])

export class DevicePicker extends React.PureComponent {
  static propTypes = {
    options: PropTypes.objectOf(deviceProp).isRequired,
    type: PropTypes.string.isRequired,
    value: deviceConstraintProp.isRequired,
    onChange: PropTypes.string
  }
  handleChange = event => {
    const { onChange } = this.props
    onChange(event.target.value)
  }
  render () {
    const { value, onChange, options, type } = this.props

    const selectValue = String(value)

    return (
      <fieldset>
        <label>Select {type} input device</label>
        <select onChange={onChange} value={selectValue}>
          <option value="false">None</option>
          <option value="true">Default</option>
          {_.map(options, (device, deviceId) => (
            <option key={deviceId} value={deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </fieldset>
    )
  }
}

export default class Devices extends React.PureComponent {
  static propTypes = {
    setAudioDevice: PropTypes.func.isRequired,
    setVideoDevice: PropTypes.func.isRequired,
    init: PropTypes.func.isRequired,
    audioDevices: PropTypes.arrayOf(deviceProp).isRequired,
    videoDevices: PropTypes.arrayOf(deviceProp).isRequired,
    audio: PropTypes.deviceConstraintProp.isRequired,
    video: PropTypes.deviceConstraintProp.isRequired
  }
  handleAudioSelect = event => {
    const { setAudioDevice } = this.props
    setAudioDevice(event.target.value)
  }
  handleVideoSelect = event => {
    const { setVideoDevice } = this.props
    setVideoDevice(event.target.value)
  }
  handleAudioCheck = event => {
    const { setAudioDevice } = this.props
    setAudioDevice(event.target.value)
  }
  handleVideoCheck = event => {
    const { setVideoDevice } = this.props
    setVideoDevice(event.target.value)
  }
  handleSubmit = event => {
    const { init } = this.props
    const { name } = this.refs.name
    event.preventDefault()
    init({ name })
  }
  render () {
    const { audio, setAudioDevice, audioDevices } = this.props
    const { video, setVideoDevice, videoDevices } = this.props
    return (
      <form className="devices" onSubmit={this.handleSubmit}>
        <DevicePicker
          onChange={setAudioDevice}
          options={audioDevices}
          value={audio}
        />
        <DevicePicker
          onChange={setVideoDevice}
          options={videoDevices}
          value={video}
        />
        <fieldset>
          <label>Enter your name</label>
          <input refs="name" type="text">Placeholder</input>
        </fieldset>
        <button type="submit">
          <i className="fa fa-sign-in" />
          <span>Save</span>
        </button>
      </form>
    )
  }
}
