
export const button = {
  cursor: 'pointer',
  backgroundColor: 'white',
  borderRadius: 10,
  border: '1px solid #ccc',
  padding: '5px 10px',
  marginBottom: 10,
  ':hover': {
    backgroundColor: '#eee',
  },
};


export const bigButton = {
  ...button,
  border: '1px solid #aaa',
  fontSize: 20,
}

export const smallButton = {
  ...button,
  border: 'none',
  fontSize: 12,
}

export const title = {
  fontSize: 40,
  marginBottom: 20,
}

export const input = {
  padding: '5px 10px',
  fontSize: 20,
  marginBottom: 10,
}




/** WEBPACK FOOTER **
 ** ./src/styles.js
 **/