'use strict';

const React = require('react');

// data
const Store = require('data/store');

// components
const PlayerDisplay = require('./playerDisplay/playerDisplay.jsx');


const Menu = React.createClass({

	componentDidMount: function() {
	},

	render: function() {
		return (
			<div className="menu">
				<PlayerDisplay />
			</div>
		);
	},

});

module.exports = Store.createSmartComponent(Menu,
	(props) => {
		return {
			player: Store.getPlayer(),
		};
	}
);
