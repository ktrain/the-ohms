'use strict';

const React = require('react');

// data
const Actions = require('data/actions');
const Store = require('data/store');

// components
const Lobby = require('./lobby/lobby.jsx');


const Game = React.createClass({

	getDefaultProps: function() {
		return {
			player: null,
			gameState: null,
		};
	},

	componentDidMount: function() {
		if (!this.props.gameState) {
			Actions.setPageState('Menu');
		}
		if (!this.props.player) {
			Actions.setPageState('NameAgent');
		}
	},

	renderStage: function() {
		switch (this.props.gameState.state) {
			case 'waiting for players':
				return <Lobby {...this.props} />
			default:
				throw new Error(`Invalid game state: ${this.props.gameState.state}`);
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

module.exports = Store.createSmartComponent(
	Game,
	() => {
		return {
			player: Store.getPlayer(),
			gameState: Store.getGameState(),
		};
	}
);
