'use strict';

import React from 'react';
import './style.scss';
const { remote } = window.require('electron');
const { dialog } = remote;

class DirectoryField extends React.Component {

    state = {};

    render() {

        const choose = () => {

            const value = dialog.showOpenDialog({properties: ['openDirectory']});
            if (value) {
                this.onChange(value[0]);
            }

        }

        let btLabel = this.value ? 'Choose Another Folder' : 'Choose a Folder';

        return (
            <div className="field field-directory">
                <div className="field-label">{ this.label }</div>
                <div className="value">
                    Folder: { this.value }
                </div>
                <div className="bt" onClick={ choose }>
                    { btLabel }
                </div>
                { this.help && <span className="help">{ this.help }</span> }
            </div>
        );

    }

    get field() {

        return this.props.field;

    }

    get value() {

        return this.props.value;

    }

    get label() {

        return this.field.label;

    }

    get type() {

        return this.field.type;

    }

    get help() {

        return this.field.help;

    }

    get onChange() {

        return this.props.onChange;

    }

}

export default DirectoryField;
