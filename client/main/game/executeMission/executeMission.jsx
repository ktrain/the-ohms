'use strict';

const React = require('react');
const cx = require('classnames');

// data
const Actions = require('data/actions');


const ExecuteMission = React.createClass({

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

	renderWaiting: function() {
		return (
			<div className="waiting">Waiting for team to execute mission</div>
		);
	},

	handleSucceedClick: function(evt) {
		evt.preventDefault();
		this.setState({ selection: true });
	},

	handleFailClick: function(evt) {
		evt.preventDefault();
		this.setState({ selection: false });
	},

	handleSubmitClick: function(evt) {
		evt.preventDefault();
		if (this.state.selection === true) {
			Actions.succeedMission();
		} else {
			Actions.failMission();
		}
	},

	renderMission: function() {
		const action = this.props.game.getAction();
		const selection = this.state.selection;
		const succeedButtonClasses = cx("succeed", { selected: selection === true });
		const failButtonClasses = cx("fail", { selected: selection === false });

		return (
			<div className="mission">
				<div className="options">
					<button onClick={this.handleSucceedClick} className={succeedButtonClasses}>Succeed</button>
					<button onClick={this.handleFailClick} className={failButtonClasses}>Fail</button>
				</div>
				<button disabled={selection === null} onClick={this.handleSubmitClick}>Confirm</button>
			</div>
		);
	},

	render: function() {
		let content = this.renderWaiting();
		if (this.props.game.amOnTeam()) {
			content = this.renderMission();
		}
		return (
			<div className="executeMission">
				<div className="title">Executing Mission</div>
				{content}
			</div>
		);
	},

});

module.exports = ExecuteMission;
