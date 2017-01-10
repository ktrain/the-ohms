'use strict';

var React = require('react');
var Headtags = require('vitreum/headtags');

// components
var Game = require('./game.jsx');

var Main = React.createClass({

	render: function() {
		console.log('props', this.props);
		return <main>
			<Headtags.title>The Ohms</Headtags.title>
			<Headtags.meta name="description" content="Can you resist?" />

			<Game path={this.props.url} />
		</main>;
	},

});

module.exports = Main;
