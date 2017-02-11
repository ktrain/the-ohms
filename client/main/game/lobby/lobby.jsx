'use strict';

const React = require('react');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const Lobby = React.createClass({

	getDefaultProps: function() {
		return {
			gameState: null,
		};
	},

	handleBackButtonClick: function(evt) {
		evt.preventDefault();
		Actions.leaveGame();
		Actions.setPageState('Menu');
	},

	renderPlayers: function() {
		return _.map(this.props.gameState.players, (player, index) => {
			return (
				<li key={index} className="player">
					<div className="status ready">Ready</div>
					<div className="name">{player.name}</div>
				</li>
			);
		});
	},

	render: function() {
		const gameState = this.props.gameState;
		return (
			<div className="lobby">
				<div className="header">
					<a onClick={this.handleBackButtonClick} className="backButton">&lt;-</a>
					<div className="title">{gameState.name} Lobby</div>
					<div className="playerCount">{gameState.players.length} players</div>
				</div>
				<ul className="players">
					{this.renderPlayers()}
				</ul>
			</div>
		);
	},

});

module.exports = Lobby;
