'use strict';

import React from 'react';
import './style.scss';

class DropdownField extends React.Component {

    state = {};

    render() {

        const options = this.options.map((option, idx) => {
            return (
                <option value={option.value} key={idx}>{option.label}</option>
            );
        });

        return (
            <div className="field field-dropdown">
                <div className="field-label">{ this.label }</div>
                <select onChange={ this.onChange.bind(this) } value={ this.value }>
                    <option value="">-- Select One --</option>
                    { options }
                </select>
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

    get options() {

        return this.field.options || [];

    }

    get help() {

        return this.field.help;

    }

    onChange(e) {

        return this.props.onChange(e.target.value);

    }

}

export default DropdownField;
