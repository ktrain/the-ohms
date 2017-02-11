'use strict';

const React = require('react');


const Lobby = React.createClass({

	getDefaultProps: function() {
		return {
			gameState: null,
		};
	},

	render: function() {
		const gameState = this.props.gameState;
		return (
			<div className="lobby">
				<div className="header">
					<a className="backButton">&lt;-</a>
					<div className="title">{gameState.name} Lobby</div>
					<div className="playerCount">{gameState.players.length} players</div>
				</div>
			</div>
		);
	},

});

module.exports = Lobby;
