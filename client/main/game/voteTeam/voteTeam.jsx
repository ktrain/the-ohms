'use strict';

const React = require('react');
const cx = require('classnames');
const _ = require('lodash');

// data
const Actions = require('data/actions');


const VoteTeam = React.createClass({

	getDefaultProps: function() {
		return {
			game: null,
		};
	},

	getInitialState: function() {
		return {
			selection: null,
		};
	},

	handleRejectClick: function(evt) {
		evt.preventDefault();
		this.setState({ selection: false });
	},

	handleApproveClick: function(evt) {
		evt.preventDefault();
		this.setState({ selection: true });
	},

	handleSubmitClick: function(evt) {
		evt.preventDefault();
		if (this.state.selection === true) {
			Actions.approveTeam();
		} else {
			Actions.rejectTeam();
		}
	},

	renderTeam: function() {
		const game = this.props.game;
		const team = _.map(game.getCurrentRound().team, (playerId, i) => {
			return (
				<li key={i}>{game.getPlayer(playerId).name}</li>
			);
		});
		return (
			<div className="team">
				<ul>{team}</ul>
			</div>
		);
	},

	renderVotingButtons: function() {
		const vote = this.props.game.getVote();
		const selection = this.state.selection;
		console.log(selection, vote);
		const rejectButtonClasses = cx("reject", {
			selected: selection === false,
			disabled: vote !== null,
		});
		const approveButtonClasses = cx("approve", {
			selected: selection === true,
			disabled: vote !== null,
		});

		return (
			<div className="votingButtons">
				<div className="options">
					<button className={rejectButtonClasses} onClick={this.handleRejectClick}>Reject</button>
					<button className={approveButtonClasses} onClick={this.handleApproveClick}>Approve</button>
				</div>
				<button onClick={this.handleSubmitClick} disabled={this.state.selection === null}>Confirm</button>
			</div>
		);
	},

	renderPolls: function() {
		return (
			<div className="polls">
				Waiting for other players to vote
			</div>
		);
	},

	renderVoting: function() {
		let content;
		const vote = this.props.game.getVote();
		if (vote === null) {
			content = this.renderVotingButtons();
		} else {
			content = this.renderPolls();
		}

		return (
			<div className="voting">{content}</div>
		);
	},

	render: function() {
		return (
			<div className="voteTeam">
				<div className="title">Voting On Team</div>
				{this.renderTeam()}
				{this.renderVoting()}
			</div>
		);
	},

});

module.exports = VoteTeam;
