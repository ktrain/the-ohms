'use strict';

const React = require('react');
const _ = require('lodash');
const Headtags = require('vitreum/headtags');

// data
const Store = require('data/store');
const Actions = require('data/actions');

// components
const Textbox = require('components/form/textbox.jsx');


const NameAgentPage = React.createClass({

	getInitialState: function() {
		const state = {};
		const player = Store.getPlayer();
		if (player) {
			state.name = player.name;
		}
		return state;
	},

	handleClear: function(evt) {
		evt.preventDefault();
		this.setState({ name: '' }, () => {
			this.refs.name.focus();
		});
	},

	handleChange: function(evt) {
		this.setState({ name: evt.target.value });
	},

	handleSubmit: function(evt) {
		evt.preventDefault();
		Actions.createPlayer(this.state.name)
			.then(() => {
				Actions.setPageState('GameList');
			});
	},

	render: function() {
		return (
			<div className="nameAgent page">
				<div className="title">
					Ohms
				</div>
				<form onSubmit={this.handleSubmit}>
					<a className="clear" onClick={this.handleClear}>X</a>
					<Textbox ref="name" value={this.state.name} onChange={this.handleChange} />

					<button>Activate Agent</button>
				</form>
			</div>
		);
	},

});

module.exports = NameAgentPage;
