'use strict';

import React from 'react';
import './style.scss';

class Sidebar extends React.Component {

    render() {

        const sections = this.options.sections.map((section) => {
            let className = 'sidebar-section';
            if (this.activeSection === section.id) {
                className += ' active';
            }
            return (
                <div key={ section.id } className={ className } onClick={ this.selectSection.bind(this, section.id) }>
                    <img className="section-icon" src={ 'svg/' + section.icon + '.svg' } />
                    <span className="section-label">{ section.label }</span>
                </div>
            );
        });

        return (
            <div className="sidebar">
                { sections }
            </div>
        );

    }

    get options() {

        return this.props.options;

    }

    get activeSection() {

        return this.props.activeSection;

    }

    get onSelectSection() {

        return this.props.onSelectSection;

    }

    selectSection(sectionId) {

        this.setState({
            'activeSection': sectionId
        });

        this.onSelectSection(sectionId);

    }

}

module.exports = Sidebar;
