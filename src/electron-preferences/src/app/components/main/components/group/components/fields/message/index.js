'use strict';

import React from 'react';
import './style.scss';
const { remote } = window.require('electron');
const { dialog } = remote;

class MessageField extends React.Component {

    state = {};

    render() {

        if (!this.heading && !this.content) {
            return null;
        }

        return (
            <div className="field field-message">
                { this.heading && <div className="field-heading">{ this.heading }</div> }
                <div className="field-content" dangerouslySetInnerHTML={ this.getContent() }></div>
            </div>
        );

    }

    get field() {

        return this.props.field;

    }

    get content() {

        return this.field.content;

    }

    get heading() {

        return this.field.heading;

    }

    getContent() {

        return {
            '__html': this.content
        };

    }

}

export default MessageField;
