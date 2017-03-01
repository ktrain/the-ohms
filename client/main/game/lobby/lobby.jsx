'use strict';

const React = require('react');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const Lobby = React.createClass({

	getDefaultProps: function() {
		return {
			minNumPlayers: 2,
			player: null,
			game: null,
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

	handleStartClick: function(evt) {
		evt.preventDefault();
		Actions.startGame();
	},

	renderPlayerRight: function(playerId) {
		const game = this.props.game;
		const leader = game.getLeader();

		if (playerId === game.playerId) {
			return <div className="right ready">You</div>
		}
		if (game.amLeader()) {
			return <div className="right"><a onClick={this.handleKickClick.bind(this, playerId)}>X</a></div>
		}
		if (playerId === leader.id) {
			return <div className="right ready">Leader</div>
		}
		return <div className="right ready">Ready</div>
	},

	renderPlayers: function() {
		const players = this.props.game.players;
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
		let content = 'Ready To Start';
		if (this.props.game.players.length < this.props.minNumPlayers) {
			content = 'Waiting For Players';
		} else if (this.props.game.amLeader()) {
			content = <button onClick={this.handleStartClick}>Start</button>;
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
		return (
			<div className="lobby">
				<div className="header">
					<div className="left">
						<a onClick={this.handleBackButtonClick} className="backButton">
							<i className="fa fa-arrow-left" />
						</a>
					</div>
					<div className="title">{this.props.game.name} Lobby</div>
					<div className="playerCount">{this.props.game.players.length} players</div>
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
