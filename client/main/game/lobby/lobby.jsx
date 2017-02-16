'use strict';

const React = require('react');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const Lobby = React.createClass({

	getDefaultProps: function() {
		return {
			minNumPlayers: 5,
			player: null,
			gameState: null,
		};
	},

	handleBackButtonClick: function(evt) {
		evt.preventDefault();
		Actions.leaveGame();
		Actions.setPageState('Menu');
	},

	handleKickClick: function(playerId, evt) {
		evt.preventDefault();
		Actions.kickPlayer(playerId);
	},

	renderPlayerRight: function(playerId) {
		const players = this.props.gameState.players;
		const amLeader = (players[0].id === this.props.player.id);
		if (playerId === this.props.player.id) {
			return <div className="right ready">You</div>
		}
		if (playerId === players[0].id) {
			return <div className="right ready">Leader</div>
		}
		if (amLeader) {
			return <div className="right"><a onClick={this.handleKickClick.bind(this, playerId)}>X</a></div>
		}
		return <div className="right ready">Ready</div>
	},

	renderPlayers: function() {
		const players = this.props.gameState.players;
		return _.map(players, (player, index) => {
			return (
				<li key={index} className="player">
					{this.renderPlayerRight(player.id)}
					<div className="name">{player.name}</div>
				</li>
			);
		});
	},

	renderStatus: function() {
		const players = this.props.gameState.players;
		const amLeader = (players[0].id === this.props.player.id);
		let content = 'Ready To Start';
		if (players.length < this.props.minNumPlayers) {
			content = 'Waiting For Players';
		} else if (amLeader) {
			content = <button onClick={this.handleStart}>Start</button>;
		}
		const start = (
			<div className="start">{content}</div>
		);

		return (
			<div className="status">
				{start}
			</div>
		);
	},

	render: function() {
		const gameState = this.props.gameState;
		return (
			<div className="lobby">
				<div className="header">
					<div className="left">
						<a onClick={this.handleBackButtonClick} className="backButton">
							<i className="fa fa-arrow-left" />
						</a>
					</div>
					<div className="title">{gameState.name} Lobby</div>
					<div className="playerCount">{gameState.players.length} players</div>
				</div>
				<ul className="players">
					{this.renderPlayers()}
				</ul>
				{this.renderStatus()}
			</div>
		);
	},

});

module.exports = Lobby;
