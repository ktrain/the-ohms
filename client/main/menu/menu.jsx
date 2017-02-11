'use strict';

const React = require('react');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const Menu = React.createClass({

	getDefaultProps: function() {
		return {
			playerName: '',
			games: [],
		};
	},

	componentDidMount: function() {
		Actions.getGames();
	},

	handlePlayerClick: function(evt) {
		evt.preventDefault();
		Actions.setPageState('NameAgent');
	},

	handleGameClick: function(gameId, evt) {
		evt.preventDefault();
		Actions.connectAndJoinGame(gameId);
	},

	handleNewGameClick: function(evt) {
		evt.preventDefault();
		Actions.connectAndCreateGame();
	},

	renderGameList: function() {
		console.log('games', this.props.games);
		const games = _.map(this.props.games, (game, index) => {
			return (
				<li key={index} className="game">
					<a onClick={this.handleGameClick.bind(this, game.id)}>
						<div className="right">
							<div className="players">{game.players.length} players</div>
							<div className="status" />
						</div>
						<div className="name">{game.name}</div>
					</a>
				</li>
			);
		});
		return (
			<ul className="list">
				{games}
			</ul>
		);
	},

	render: function() {
		return (
			<div className="menu page">
				<div className="title">Ohms</div>
				<div className="player">
					Welcome agent <a onClick={this.handlePlayerClick}>{this.props.playerName}</a>.
				</div>
				<div className="create">
					<button onClick={this.handleNewGameClick}>Create New Game</button>
				</div>
				<div className="joinMessage">or join an existing game:</div>
				{this.renderGameList()}
			</div>
		);
	},

});

module.exports = Menu;
