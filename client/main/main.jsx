'use strict';

var React = require('react');
var Headtags = require('vitreum/headtags');

// components
var Game = require('./game.jsx');

var Main = React.createClass({

	render: function() {
		return <main>
			<Headtags.title>The Ohms</Headtags.title>
			<Headtags.meta name="description" content="Can you resist?" />

			{/*<Headtags.meta name="viewport" content="width=device-width, initial-scale=1" />*/}

			<Game path={this.props.url} />
		</main>;
	},

});

module.exports = Main;
