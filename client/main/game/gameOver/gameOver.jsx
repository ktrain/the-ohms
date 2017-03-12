'use strict';

const React = require('react');
const _ = require('lodash');


const GameOver = React.createClass({

	getDefaultProps: function() {
		return {
			game: null,
		};
	},

	render: function() {
		return (
			<div className="gameOver">
				{this.props.game.state}
			</div>
		);
	},

});

module.exports = GameOver;
