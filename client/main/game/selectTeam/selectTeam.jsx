'use strict';

const React = require('react');
const cx = require('classnames');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const SelectTeam = React.createClass({

	getDefaultProps: function() {
		return {
			game: null,
		};
	},

	getInitialState: function() {
		return {
			team: {},
		};
	},

	handlePlayerClick: function(playerId, evt) {
		evt.preventDefault();
		const team = this.state.team;
		if (team[playerId]) {
			delete team[playerId];
		} else {
			team[playerId] = true;
		}
		this.setState({ team });
	},

	handleConfirmTeam: function(evt) {
		evt.preventDefault();
		Actions.selectTeam(_.keys(this.state.team));
	},

	renderTeamSelection: function() {
		const players = _.map(this.props.game.players, (player, i) => {
			const classes = cx("player", { selected: this.state.team[player.id] });
			return (
				<li key={i}>
					<a className={classes} onClick={this.handlePlayerClick.bind(this, player.id)}>{player.name}</a>
				</li>
			);
		});
		return (
			<div className="playerList">
				<ul>
					{players}
				</ul>
				<button onClick={this.handleConfirmTeam}>Confirm Team</button>
			</div>
		);
	},

	renderWaiting: function() {
		return `Waiting for ${this.props.game.getLeader().name} to select a team`;
	},

	render: function() {
		let content = this.renderWaiting();
		if (this.props.game.amLeader()) {
			console.log(this.state.team);
			content = this.renderTeamSelection();
		}

		return (
			<div className="selectTeam">
				<div className="title">Select Mission Team</div>
				{content}
			</div>
		);
	},

});

module.exports = SelectTeam;
