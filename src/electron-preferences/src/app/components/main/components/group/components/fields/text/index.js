'use strict';

import React from 'react';
import './style.scss';

class TextField extends React.Component {

    state = {};

    render() {

        return (
            <div className="field field-text">
                <div className="field-label">{ this.label }</div>
                <input type={ this.inputType } onChange={ this.onChange.bind(this) } value={ this.value }/>
                { this.help && <span className="help">{ this.help }</span> }
            </div>
        );

    }

    get field() {

        return this.props.field;

    }

    get value() {

        return this.props.value || '';

    }

    get label() {

        return this.field.label;

    }

    get inputType() {

        return this.field.inputType || "text";

    }

    get help() {

        return this.field.help;

    }

    onChange(e) {

        return this.props.onChange(e.target.value);

    }

}

export default TextField;
