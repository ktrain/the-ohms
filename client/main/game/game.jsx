'use strict';

const React = require('react');

// data
const Actions = require('data/actions');
const Store = require('data/store');

// components
const Lobby = require('./lobby/lobby.jsx');
const SelectTeam = require('./selectTeam/selectTeam.jsx');
const VoteTeam = require('./voteTeam/voteTeam.jsx');
const ExecuteMission = require('./executeMission/executeMission.jsx');
const GameOver = require('./gameOver/gameOver.jsx');


const Game = React.createClass({

	getDefaultProps: function() {
		return {
			game: null,
		};
	},

	componentWillReceiveProps: function() {
		if (!this.props.game) {
			Actions.setPageState('Menu');
		}
	},

	renderStage: function() {
		switch (this.props.game.state) {
			case 'waiting for players':
				return <Lobby {...this.props} />;
			case 'selecting team':
				return <SelectTeam {...this.props} />;
			case 'voting on team':
				return <VoteTeam {...this.props} />;
			case 'executing mission':
				return <ExecuteMission {...this.props} />;
			case 'ohms win':
			case 'spies win':
				return <GameOver {...this.props} />;
			default:
				throw new Error(`Invalid game state: ${this.props.game.state}`);
		}
	},

	render: function() {
		return (
			<div className="game page">
				{this.renderStage()}
			</div>
		);
	},

});

module.exports = Game;
