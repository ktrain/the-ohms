'use strict';

const React = require('react');

// data
const Actions = require('data/actions');
const Store = require('data/store');

// components
const Lobby = require('./lobby/lobby.jsx');
const SelectTeam = require('./selectTeam/selectTeam.jsx');


const Game = React.createClass({

	getDefaultProps: function() {
		return {
			player: null,
			game: null,
		};
	},

	componentDidMount: function() {
		if (!this.props.game) {
			Actions.setPageState('Menu');
		}
		if (!this.props.player) {
			Actions.setPageState('NameAgent');
		}
	},

	renderStage: function() {
		switch (this.props.game.state) {
			case 'waiting for players':
				return <Lobby {...this.props} />;
			case 'selecting team':
				return <SelectTeam {...this.props} />;
			default:
				throw new Error(`Invalid game state: ${this.props.game.state}`);
		}
	},

	render: function() {
		console.log('game props', this.props);
		return (
			<div className="game page">
				{this.renderStage()}
			</div>
		);
	},

});

module.exports = Game;
