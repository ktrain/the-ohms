'use strict';

const React = require('react');
const cx = require('classnames');


const SelectTeam = React.createClass({

	getDefaultProps: function() {
		return {
			game: null,
		};
	},

	renderWaiting: function() {
	},

	render: function() {
		let content = this.renderWaiting();
		if (this.props.game.amLeader()) {
			content = this.renderTeamSelection();
		}

		return (
			<div className="selectTeam">
				{content}
			</div>
		);
	},

});

module.exports = SelectTeam;
