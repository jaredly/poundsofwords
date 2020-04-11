// @flow
import React, { Component } from 'react';

import { useHistory } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';
import { input, button, bigButton } from './styles';
import stateful from './stateful';
import TimePicker from './TimePicker';
import BlurBounceInput from './BlurBounceInput';
import NewTimer from './NewTimer';
import MaybeDelete from './MaybeDelete';

import type { Entry } from './types';

const lagTimes = {
    easy: 10000,
    normal: 5000,
    speedy: 2000,
};

const countWords = (text) => text.split(/\s+/g).length;

type Props = {
    match: { params: { id: string } },
    user: any,
    db: any,
};

type State = {
    text: string,
    captive: string,
    loading: boolean,
    entry: Entry,

    currentTime?: number,
    captiveWords?: number,
    startOnTyping?: boolean,
    lastType?: ?number,
    startTime?: ?number,
    timerStart?: ?number,
    percentLeft?: ?number,
    timerPercent?: ?number,
    dirty?: boolean,
    lastSave?: number,
    loading: boolean,
};

const Loader = (props: Props) => {
    const [entry, setEntry] = React.useState(null);
    const history = useHistory();
    React.useEffect(() => {
        props.db
            .collection(`entries/${props.user.uid}/basic`)
            .doc(props.match.params.id)
            .get()
            .then((doc) => {
                console.log(doc);
                setEntry(doc.data());
            });
    }, [props.match.params.id]);

    if (entry) {
        return <Editor {...props} entry={entry} history={history} />;
    } else {
        return <div>Loading entry...</div>;
    }
};

type InnerProps = Props & { entry: Entry };

export default Loader;

const doTabIndent = (text: string, start: number, end: number) => {
    return text;
};

class Editor extends Component<InnerProps, State> {
    _iv: ?IntervalID;
    _savet: ?TimeoutID;
    _t: ?HTMLTextAreaElement;

    constructor(props: InnerProps) {
        super();
        if (props.entry.running) {
            this.state = {
                entry: props.entry,
                captive: props.entry.text,
                captiveWords: countWords(props.entry.text),
                startOnTyping: true,
                text: '',
                lastType: null,
                startTime: null,
                timerStart: null,
                percentLeft: null,
                loading: false,
            };
        } else {
            this.state = {
                entry: props.entry,
                captive: '',
                loading: false,
                lastType: null,
                startTime: null,
                timerStart: null,
                percentLeft: null,
                captiveWords: 0,
                text: props.entry.text,
                startOnTyping: false,
                // startOnTyping: !entry.text,
            };
        }
    }

    saveEntry(vals: $Shape<Entry>) {
        const id = this.state.entry.id;
        const entry = {
            ...this.state.entry,
            ...vals,
        };
        this.setState({ entry });
        this.props.db
            .collection(`entries/${this.props.user.uid}/basic`)
            .doc(entry.id)
            .update(vals);
    }

    start() {
        this.saveEntry({
            running: true,
        });
        this.setState({
            startTime: Date.now(),
            timerStart: Date.now(),
            lastType: Date.now(),
            percentLeft: 1,
            startOnTyping: false,
        });
        clearInterval(this._iv);
        this._iv = setInterval(() => {
            this.tick();
        }, 50);
    }

    saveCurrentText() {
        let text = '';
        if (this.state.captive.length > 0) {
            text = this.state.captive + '\n';
        }
        text += this.state.text;
        this.setState({
            lastSave: Date.now(),
            dirty: false,
        });
        this.saveText(text);
    }

    saveText(text: string) {
        const { id } = this.state.entry;
        this.props.db
            .collection(`entries/${this.props.user.uid}/basic`)
            .doc(id)
            .update({ text });
    }

    capture() {
        const captive = this.state.captive + '\n' + this.state.text;
        clearInterval(this._iv);
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
        });
    }

    finish() {
        let text = '';
        if (this.state.captive.length > 0) {
            text = this.state.captive + '\n';
        }
        text += this.state.text;
        if (!this.state.entry) {
            return;
        }

        this.saveEntry({ running: false, text });

        // let entry: Entry = {
        //     ...this.state.entry,
        //     running: false,
        //     text,
        // };

        this.setState({
            captive: '',
            dirty: false,
            // entry,
            text,
        });

        // Kinvey.DataStore.update('entries', entry).catch((err) => {
        //     console.error('failed to save finished entry', entry, err);
        // });
    }

    tick() {
        if (this.state.startOnTyping || !this.state.entry.running) return;
        let percentLeft = 1;

        let dt = Date.now() - (this.state.lastType || 0);
        if (dt >= lagTimes[this.state.entry.speed]) {
            this.capture();
            return;
        }
        // TODO maybe lagOff should be lagTimes[this.state.entry.speed] * .2?
        // Not sure how speedy will feel...
        let lagOff = 1000;
        dt = Math.max(0, dt - lagOff) + 20;

        percentLeft = 1 - dt / (lagTimes[this.state.entry.speed] - lagOff);

        const timerDt = Date.now() - (this.state.timerStart || 0);

        if (timerDt >= this.state.entry.time * 60 * 1000) {
            this.finish();
            return;
        }

        this.setState({
            percentLeft,
            currentTime: Date.now(),
            timerPercent: timerDt / (this.state.entry.time * 60 * 1000),
        });
    }

    componentWillUnmount() {
        clearInterval(this._iv);
    }

    keydown(e: KeyboardEvent) {
        if (e.metaKey || e.ctrlKey || e.altKey) {
            return;
        }
        if (e.key === 'Tab') {
            const input = e.target;
            // $FlowFixMe
            const { value, selectionStart, selectionEnd } = input;
            const newValue = doTabIndent(value, selectionStart, selectionEnd);
            this.setState({ text: newValue });
        }
        if (!this.state.entry.running) {
            if (!this.state.startOnTyping) {
                return;
            }
            // this.saveEntry({running: true})
            return this.start();
        }
        if (this.state.startOnTyping) {
            return this.start();
        }
        let timerStart = this.state.timerStart;
        if (this.state.startOnTyping) {
            timerStart = Date.now();
        }
        this.setState({
            lastType: Date.now(),
            timerStart,
            startOnTyping: false,
        });
    }

    typed(e: InputEvent) {
        clearTimeout(this._savet);
        const saveLag = 10000;
        let lastSave = this.state.lastSave || 0;
        let dirty = true;
        if (Date.now() - lastSave > saveLag) {
            let text = '';
            if (this.state.captive.length) {
                text = this.state.captive + '\n';
            }
            text += e.target.value;
            console.log('saving');
            this.saveText(text);
            dirty = false;
            lastSave = Date.now();
        } else {
            this._savet = setTimeout(() => {
                if (this.state.dirty) {
                    console.log('saving after wait');
                    this.saveCurrentText();
                }
            }, 500);
        }
        this.setState({
            text: e.target.value,
            lastSave,
            dirty,
        });
    }

    summaryMessage() {
        return (
            <div className={css(styles.summary)}>
                Write for {this.state.entry.time} minutes without pausing for
                more than {parseInt(lagTimes[this.state.entry.speed] / 1000)}{' '}
                seconds.
            </div>
        );
    }

    renderCaptive() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <div className={css(styles.captive)}>
                    <div className={css(styles.lockSymbol)}>🔒</div>
                    <div className={css(styles.wordsLocked)}>
                        {this.state.captiveWords} words locked
                    </div>
                    <div className={css(styles.spacer)} />
                    <div className={css(styles.preview)}>
                        ... {this.state.captive.slice(-50)}
                    </div>
                </div>
                <button
                    style={{ marginLeft: 16 }}
                    onClick={() => {
                        this.finish();
                    }}
                >
                    Cancel timer
                </button>
            </div>
        );
    }

    renderTop() {
        if (!this.state.entry.running) {
            if (this.state.startOnTyping) {
                return this.summaryMessage();
            } else {
                return (
                    <NewTimer
                        time={this.state.entry.time}
                        speed={this.state.entry.speed}
                        saveEntry={this.saveEntry.bind(this)}
                        onStart={() => this.setState({ startOnTyping: true })}
                    />
                );
            }
        }
        if (this.state.startOnTyping) {
            if (!this.state.captive.length) {
                return (
                    <div className={css(styles.paused)}>
                        Just start typing and we'll start the timer.
                    </div>
                );
            }
            return (
                <div className={css(styles.paused)}>
                    Time's up! Don't pause too long or the timer will restart.
                    Start typing to continue.
                </div>
            );
        }
        // const {percentLeft = 0, timerPercent = 0} = this.state;
        const percentLeft = this.state.percentLeft ?? 0;
        const timerPercent = this.state.timerPercent ?? 0;
        return (
            <div className={css(styles.timers)}>
                <div className={css(styles.tickerContainer)}>
                    <div
                        style={{
                            width: 100 * percentLeft + '%',
                            opacity: 1 - percentLeft,
                        }}
                        className={css(styles.ticker)}
                    />
                </div>
                <div className={css(styles.gameTimer)}>
                    <div
                        style={{
                            width: 100 * timerPercent + '%',
                        }}
                        className={css(styles.timerTicker)}
                    />
                </div>
            </div>
        );
    }

    componentDidUpdate(_: Props, prevState: State) {
        if (!this.state.loading && prevState.loading && this._t) {
            this._t.focus();
        }
    }

    renderContent() {
        return (
            <div className={css(styles.game)}>
                {this.state.captive.length > 0 && this.renderCaptive()}
                {this.renderTop()}
                <textarea
                    ref={(t) => (this._t = t)}
                    className={css(styles.textarea)}
                    value={this.state.text}
                    onChange={(e) => this.typed(e)}
                    onKeyDown={(e) => this.keydown(e)}
                />
            </div>
        );
    }

    deleteEntry() {
        // Kinvey.DataStore.destroy('entries', this.state.entry._id);
        this.props.db
            .collection(`entries/${this.props.user.uid}/basic`)
            .doc(this.props.entry.id)
            .delete();
        browserHistory.push('/');
    }

    render() {
        return (
            <div className={css(styles.container)}>
                <div
                    onClick={() => this.props.history.push('/')}
                    className={css(styles.goHome)}
                >
                    Go home
                </div>
                <div className={css(styles.title)}>
                    <BlurBounceInput
                        className={css(styles.titleInput)}
                        initial={this.state.entry.title}
                        onChange={(title) => this.saveEntry({ title })}
                    />
                </div>
                <div style={{ position: 'absolute', top: 50, left: 16 }}>
                    {this.state.dirty ? '' : 'saved'}
                </div>
                {this.renderContent()}
                <MaybeDelete onDelete={() => this.deleteEntry()} />
            </div>
        );
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
        flex: 1,
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
