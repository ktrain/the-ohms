'use strict';

const React = require('react');

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

	render: function() {
		const gameState = this.props.gameState;
		return (
			<div className="lobby">
				<div className="header">
					<a onClick={this.handleBackButtonClick} className="backButton">&lt;-</a>
					<div className="title">{gameState.name} Lobby</div>
					<div className="playerCount">{gameState.players.length} players</div>
				</div>
			</div>
		);
	},

});

module.exports = Lobby;
