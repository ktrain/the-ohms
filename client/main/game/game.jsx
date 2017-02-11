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
			gameState: null,
		};
	},

	componentDidMount: function() {
		if (!this.props.gameState) {
			Actions.setPageState('Menu');
		}
	},

	renderStage: function() {
		switch (this.props.gameState.state) {
			case 'waiting for players':
				return <Lobby gameState={this.props.gameState} />;
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
			gameState: Store.getGameState(),
		};
	}
);
