import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import {input, button, bigButton} from './styles'
import stateful from './stateful'
import TimePicker from './TimePicker'
import BlurBounceInput from './BlurBounceInput'
import NewTimer from './NewTimer'
import MaybeDelete from './MaybeDelete'

const lagTimes = {
  easy: 10000,
  normal: 5000,
  speedy: 2000,
}

const countWords = text => text.split(/\s+/g).length

export default class Editor extends Component {
  constructor() {
    super()
    this.state = {
      user: Kinvey.getActiveUser(),
      text: '',
      captive: '',
      entry: null,
      loading: true,
      error: null,
    }
  }

  componentWillMount() {
    Kinvey.DataStore.get('entries', this.props.params.id)
    .then(entry => {
      if (entry.running) {
        this.setState({
          entry,
          captive: entry.text,
          captiveWords: countWords(entry.text),
          startOnTyping: true,
          text: '',
          lastType: null,
          startTime: null,
          timerStart: null,
          percentLeft: null,
          loading: false,
        })
      } else {
        this.setState({
          entry,
          captive: '',
          loading: false,
          lastType: null,
          startTime: null,
          timerStart: null,
          percentLeft: null,
          captiveWords: 0,
          text: entry.text,
          startOnTyping: false,
          // startOnTyping: !entry.text,
        })
      }
    }, error => {
      console.log('tried to load an unknown entry')
    })
  }

  saveEntry(vals) {
    const entry = {
      ...this.state.entry,
      ...vals
    }
    this.setState({entry})
    Kinvey.DataStore.update('entries', entry);
  }

  start() {
    this.saveEntry({
      running: true,
    })
    this.setState({
      startTime: Date.now(),
      timerStart: Date.now(),
      lastType: Date.now(),
      percentLeft: 1,
      startOnTyping: false,
    })
    clearInterval(this._iv)
    this._iv = setInterval(() => {
      this.tick()
    }, 50);
  }

  saveCurrentText() {
    let text = ''
    if (this.state.captive.length > 0) {
      text = this.state.captive + '\n'
    }
    text += this.state.text
    this.setState({
      lastSave: Date.now(),
      dirty: false,
    })
    this.saveText(text);
  }

  saveText(text) {
    Kinvey.DataStore.update('entries', {
      ...this.state.entry,
      text
    }).catch(err => {
      console.error('failed to save! TODO display', err);
    });
  }

  capture() {
    const captive = this.state.captive + '\n' + this.state.text
    clearInterval(this._iv)
    this.saveText(captive);
    this.setState({
      currentTime: Date.now(),
      lastSave: Date.now(),
      percentLeft: 1,
      captive,
      captiveWords: captive.split(/\s+/g).length,
      startOnTyping: true,
      text: '',
      dirty: false,
    })
  }

  finish() {
    let text = ''
    if (this.state.captive.length > 0) {
      text = this.state.captive + '\n'
    }
    text += this.state.text

    let entry = {
      ...this.state.entry,
      running: false,
      text,
    }

    this.setState({
      captive: '',
      dirty: false,
      entry,
      text,
    })

    Kinvey.DataStore.update('entries', entry)
    .catch(err => {
      console.error('failed to save finished entry', entry, err);
    });
  }

  tick() {
    if (this.state.startOnTyping || !this.state.entry.running) return
    let percentLeft = 1

    let dt = Date.now() - this.state.lastType
    if (dt >= lagTimes[this.state.entry.speed]) {
      this.capture()
      return;
    }
    // TODO maybe lagOff should be lagTimes[this.state.entry.speed] * .2?
    // Not sure how speedy will feel...
    let lagOff = 1000
    dt = Math.max(0, dt - lagOff) + 20

    percentLeft = 1 - (dt / (lagTimes[this.state.entry.speed] - lagOff))

    const timerDt = Date.now() - this.state.timerStart

    if (timerDt >= this.state.entry.time * 60 * 1000) {
      this.finish()
      return
    }

    this.setState({
      percentLeft,
      currentTime: Date.now(),
      timerPercent: timerDt / (this.state.entry.time * 60 * 1000)
    })
  }

  componentWillUnmount() {
    clearInterval(this._iv)
  }

  keydown(e) {
    if (e.keyCode < 65 || e.keyCode > 90 || e.metaKey || e.ctrlKey || e.altKey) {
      return
    }
    if (!this.state.entry.running) {
      if (!this.state.startOnTyping) {
        return
      }
      // this.saveEntry({running: true})
      return this.start()
    }
    if (this.state.startOnTyping) {
      return this.start()
    }
    let timerStart = this.state.timerStart
    if (this.state.startOnTyping) {
      timerStart = Date.now()
    }
    this.setState({
      lastType: Date.now(),
      timerStart,
      startOnTyping: false,
    })
  }

  typed(e) {
    clearTimeout(this._savet)
    const saveLag = 10000
    let lastSave = this.state.lastSave;
    let dirty = true
    if (Date.now() - lastSave > saveLag) {
      let text = ''
      if (this.state.captive.length) {
        text = this.state.captive + '\n'
      }
      text += e.target.value
      this.saveText(text)
      dirty = false
      lastSave = Date.now()
    } else {
      this._savet = setTimeout(() => {
        if (this.state.dirty) {
          this.saveCurrentText()
        }
      }, 500)
    }
    this.setState({
      text: e.target.value,
      lastSave,
      dirty,
    });
  }

  summaryMessage() {
    return <div className={css(styles.summary)}>
      Write for {this.state.entry.time} minutes without pausing for more than {parseInt(lagTimes[this.state.entry.speed] / 1000)} seconds.
    </div>
  }

  renderCaptive() {
    return (
      <div className={css(styles.captive)}>
        <div className={css(styles.lockSymbol)}>
          🔒
        </div>
        <div className={css(styles.wordsLocked)}>
          {this.state.captiveWords} words locked
        </div>
        <div className={css(styles.spacer)}/>
        <div className={css(styles.preview)}>
        ... {this.state.captive.slice(-50)}
        </div>
      </div>
    )
  }

  renderTop() {
    if (!this.state.entry.running) {
      if (this.state.startOnTyping) {
        return this.summaryMessage();
      } else {
        return <NewTimer
          time={this.state.entry.time}
          speed={this.state.entry.speed}
          saveEntry={this.saveEntry.bind(this)}
          onStart={() => this.setState({startOnTyping: true})}
        />;
      }
    }
    if (this.state.startOnTyping) {
      if (!this.state.captive.length) {
        return <div className={css(styles.paused)}>
          Just start typing and we'll start the timer.
        </div>
      }
      return <div className={css(styles.paused)}>
        Time's up! Don't pause too long or the timer will restart. Start typing to continue.
      </div>
    }
    return (
      <div className={css(styles.timers)}>
        <div className={css(styles.tickerContainer)}>
          <div
            style={{
              width: (100 * this.state.percentLeft) + '%',
              opacity: (1 - this.state.percentLeft),
            }}
            className={css(styles.ticker)}/>
        </div>
        <div className={css(styles.gameTimer)}>
          <div
            style={{
              width: (100 * this.state.timerPercent) + '%',
            }}
            className={css(styles.timerTicker)}
          />
        </div>
      </div>
    )
  }

  componentDidUpdate(_, prevState) {
    if (!this.state.loading && prevState.loading) {
      this._t.focus()
    }
  }

  renderContent() {
    return (
      <div className={css(styles.game)}>
        {this.state.captive.length > 0 && this.renderCaptive()}
        {this.renderTop()}
        <textarea
          ref={t => this._t = t}
          className={css(styles.textarea)}
          value={this.state.text}
          onChange={e => this.typed(e)}
          onKeyDown={e => this.keydown(e)}
        />
      </div>
    )
  }

  deleteEntry() {
    Kinvey.DataStore.destroy('entries', this.state.entry._id);
    browserHistory.push('/');
  }

  render() {
    if (this.state.loading) {
      return (
        <div className={css(styles.container)}>
          <div
            onClick={() => browserHistory.push('/')}
            className={css(styles.goHome)}
          >
            Go home
          </div>
          Loading...
        </div>
      )
    }
    return (
      <div className={css(styles.container)}>
        <div
          onClick={() => browserHistory.push('/')}
          className={css(styles.goHome)}
        >
          Go home
        </div>
        <div className={css(styles.title)}>
          <BlurBounceInput
            className={css(styles.titleInput)}
            initial={this.state.entry.title}
            onChange={title => this.saveEntry({title})}
          />
        </div>
        {this.renderContent()}
        <MaybeDelete onDelete={() => this.deleteEntry()}/>
      </div>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    textAlign: 'center',
    flex: 1,
    minHeight: 300,
  },

  summary: {
    marginTop: 20,
  },

  goHome: {
    position: 'absolute',
    top: 5,
    left: 5,
    padding: '10px 15px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#eee',
    },
  },

  title: {
    fontSize: 30,
  },

  titleInput: {
    fontSize: 30,
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    width: 600,
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 10,
  },

  startButton: {
    width: 100,
    ...button,
    alignSelf: 'center',
    marginTop: 30,
  },

  captive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    boxShadow: '0 0 5px #ccc inset',
    alignSelf: 'stretch',
    padding: '5px 10px',
    borderRadius: 5,
    marginTop: 10,
  },

  preview: {
    fontSize: 10,
    marginRight: 10,
  },

  lockSymbol: {
    fontSize: 14,
    color: 'black',
    height: 25,
    marginRight: 5,
  },

  spacer: {
    flex: 1,
  },

  paused: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },

  ticker: {
    height: 10,
    backgroundColor: 'red',
    alignSelf: 'flex-start',
    //height: '100%',
    transition: 'width .2s linear, opacity .2s linear',
  },

  game: {
    alignSelf: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },

  tickerContainer: {
    height: 10,
    width: 200,
    alignSelf: 'center',
    //flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gameTimer: {
    width: 600,
    height: 10,
    backgroundColor: '#dfe',
  },

  timerTicker: {
    backgroundColor: '#afc',
    height: '100%',
  },

  timers: {
    margin: '10px 0',
  },

  textarea: {
    width: 600,
    height: 800,
    fontSize: 16,
    padding: 20,
    boxSizing: 'border-box',
    border: '1px solid #ccc',
  },

});



/** WEBPACK FOOTER **
 ** ./src/Editor.js
 **/