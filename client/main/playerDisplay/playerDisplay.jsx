'use strict';

const _ = require('lodash');
const React = require('react');

// data
const Actions = require('data/actions');
const Store = require('data/store');

// components
const Textbox = require('components/form/textbox.jsx');


const PlayerDisplay = React.createClass({

	renderForm: function() {
		return (
			<form>
				<Textbox ref="nameInput" />
			</form>
		);
	},

	renderPlayer: function() {
		const playerId = _.get(this.props, 'player.data.id');
		if (!playerId) {
			return null;
		}
		return (
			<dl>
				<dt>Player ID</dt><dd>{this.props.player.data.id}</dd>
				<dt>Player Name</dt><dd>{this.props.player.data.name}</dd>
			</dl>
		);
	},

	render: function() {
		let content;
		const playerId = _.get(this.props, 'player.data.id');

		if (playerId) {
			console.log('rendering player');
			content = this.renderPlayer();
		} else {
			console.log('rendering form');
			content = this.renderForm();
		}

		return (
			<div className="playerDisplay">
				{content}
			</div>
		);
	},

});

module.exports = Store.createSmartComponent(PlayerDisplay,
	(props) => {
		return {
			player: Store.getPlayer(),
		};
	}
);
