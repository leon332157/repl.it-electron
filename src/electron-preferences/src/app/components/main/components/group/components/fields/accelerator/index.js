'use strict';

import React from 'react';
import './style.scss';

class AcceleratorField extends React.Component {

    state = {};

    constructor(props) {
        
        super(props);
        
        this.pressedKeys = [];
        this.keyCount = 0;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.mapAccelerator = this.mapAccelerator.bind(this);
        this.onChange = this.onChange.bind(this);
        
    }

    render() {

        return (
            <div className="field field-accelerator">
                <div className="field-label">{ this.label }</div>
                <input type="text" value={ this.value } onKeyDown={ this.handleKeyDown } onKeyUp={ this.handleKeyUp } readOnly />
                { this.help && <span className="help">{ this.help }</span> }
            </div>
        );

    }

    handleKeyDown(event) {
        
        event.preventDefault();

        if (this.keyCount <= 0) {
            this.pressedKeys = [];
        }

        if (this.pressedKeys.indexOf(event.key) === -1) {
            this.pressedKeys.push(event.key);
            this.keyCount++;
        }
        
        this.mapAccelerator(this.pressedKeys);
        
    }

    handleKeyUp(event) {
        
        event.preventDefault();
        this.keyCount--;
        this.mapAccelerator(this.pressedKeys);
        
    }

    mapAccelerator(keys) {
        
        let arr = keys.map((item) => {
            if (item === ' ') return "Space";
            if (item === '+') return "Plus";
            if (/^[a-z]$/.test(item)) return item.toUpperCase();
            return item;
        });
        
        this.onChange(arr.join("+"));
        
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

    get help() {

        return this.field.help;

    }

    onChange(value) {

        return this.props.onChange(value);

    }

}

export default AcceleratorField;
