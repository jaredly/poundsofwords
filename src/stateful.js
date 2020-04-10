import React, { Component } from 'react';

const stateful = (initial, Comp) => {
    const res = class Wrapper extends Component {
        // displayName: Comp.displayName;
        constructor(props) {
            super(props);
            if (typeof initial === 'function') {
                this.state = initial(props);
            } else {
                this.state = initial;
            }
        }
        render() {
            return (
                <Comp
                    {...this.props}
                    {...this.state}
                    set={(attr, val) => {
                        if ('string' === typeof attr) {
                            this.setState({ [attr]: val });
                        } else {
                            this.setState(attr);
                        }
                    }}
                />
            );
        }
    };
    res.displayName = Comp.displayName;
    return res;
};

export default stateful;

/** WEBPACK FOOTER **
 ** ./src/stateful.js
 **/
