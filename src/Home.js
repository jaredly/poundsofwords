import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';

import {input, button} from './styles'
import stateful from './stateful'

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      folders: [],
      folderName: '',
      entries: {},
    }
  }

  componentWillMount() {
    this.load()
  }

  createFolder() {
    this.setState({
      loading: true,
      folderName: '',
      entries: 0,
      modified: Date.now(),
    })
    Kinvey.DataStore.save('folders', {
      title: this.state.folderName,
      created: Date.now(),
    }).then(() => this.load())
  }

  load() {
    Kinvey.DataStore.find('folders', null)
    .then(folders => this.setState({loading: false, folders}));
  }

  openFolder(folder) {
    if (folder._id === this.state.openFolder) {
      return this.setState({openFolder: null});
    }
    const entries = this.state.entries
    this.setState({
      openFolder: folder._id,
      entries: {
        ...entries,
        [folder._id]: {
          loading: true,
          items: [],
        },
      },
    })
    const query = new Kinvey.Query()
    query.equalTo('folder', folder._id)
    const promise = Kinvey.DataStore.find('entries', query);
    promise.then(entries => {
      this.setState({
        entries: {
          ...this.state.entries,
          [folder._id]: {
            loading: false,
            items: entries || [],
          },
        },
      })
    }, err => {
      console.log('error!', err);
    });
  }

  start(folderId) {
    Kinvey.DataStore.save('entries', {
      folder: folderId,
      title: 'Entry on ' + new Date().toLocaleDateString().replace(/\//g, '.'),
      time: 5,
      speed: 'normal',
      text: '',
      running: false,
    }).then(entry => {
      browserHistory.push(
        `/edit/${entry._id}/${encodeURIComponent(entry.title)}/`
      )
    }, err => {
      console.error('failed to save', err)
    });
  }

  render() {
    return (
      <div className={css(styles.container)}>
        <div className={css(styles.title)}>
          Hola, typist!
        </div>
        <ul className={css(styles.folders)}>
          {this.state.folders.map(folder => (
            <li
              key={folder._id}
              className={css(styles.folder)}
            >
              <div
                onClick={() => this.openFolder(folder)}
                className={css(styles.folderTitle)}>
                {folder.title}
              </div>
              {this.state.openFolder === folder._id &&
                <div className={css(styles.entriesBox)}>
                  <ul
                    className={css(styles.entries)}
                  >
                    {this.state.entries[folder._id].items.map(entry => (
                      <li
                        key={entry._id}
                        className={css(styles.entry)}
                        onClick={() => {
                          browserHistory.push(
                            `/edit/${entry._id}/${encodeURIComponent(entry.title)}/`
                          )
                        }}
                      >
                        {entry.title}
                      </li>
                    ))}
                    {!this.state.entries[folder._id].loading &&
                      <li className={css(styles.newEntry)}>
                        <button
                          className={css(styles.newEntryButton)}
                          onClick={() => this.start(folder._id) }
                        >
                        New Entry
                        </button>
                      </li>}
                    {this.state.openFolder === folder._id &&
                      this.state.entries[folder._id].loading &&
                        <li className={css(styles.entriesLoading)}>
                          Loading entries...
                        </li>}
                  </ul>
                </div>}
            </li>
          ))}
          {!this.state.folders.length &&
              <li className={css(styles.noFolders)}>
                No folders
              </li>}
        </ul>
        {this.state.loading &&
          <div className={css(styles.loading)}>
            Loading...
          </div>}
        <input placeholder="New folder name"
          value={this.state.folderName}
          className={css(styles.input)}
          onKeyDown={e => e.keyCode === 13 && this.createFolder()}
          onChange={e =>
            this.setState({folderName: e.target.value})
          }
        />
        <button onClick={
          () => this.createFolder()
        }>Create Folder</button>
      </div>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flex: 1,
    textAlign: 'center',
    width: 600,
    alignSelf: 'center',
  },

  input: {
    ...input,
    marginTop: 10,
    borderRadius: 3,
    border: '1px solid #ddd',
  },

  loading: {
    padding: '10px 20px',
    textAlign: 'center',
  },

  folders: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    marginTop: 10,
  },

  folder: {
    borderBottom: '1px solid #ddd',
    textAlign: 'left',
  },

  folderTitle: {
    padding: '10px 20px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#eee',
    },
  },

  entriesBox: {
    boxShadow: '0 0 5px #ccc inset',
    borderRadius: 5,
    padding: 10,
  },

  entries: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    // marginLeft: 10,
  },

  entry: {
    padding: '10px 20px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#eee',
    },
  },

  entriesLoading: {
    padding: '10px 20px',
  },

  noEntries: {
    padding: '10px 20px',
  },

  title: {
    fontSize: 30,
    marginBottom: 20,
  },

  newEntry: {
    textAlign: 'center',
  },

  newEntryButton: {
    ...button,
    alignSelf: 'center',
    marginBottom: 0,
    marginTop: 5,
  },
});



/** WEBPACK FOOTER **
 ** ./src/Home.js
 **/