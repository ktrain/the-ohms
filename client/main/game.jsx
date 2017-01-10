'use strict';

const React = require('react');

// data
const Store = require('data/store');

// components
const PlayerDisplay = require('./playerDisplay/playerDisplay.jsx');


const Game = React.createClass({

	componentDidMount: function() {
		Store.init();
	},

	render: function() {
		return (
			<div className="game">
				<PlayerDisplay />
			</div>
		);
	},

});

module.exports = Store.createSmartComponent(Game,
	(props) => {
		return {
			player: Store.getPlayer(),
		};
	}
);
