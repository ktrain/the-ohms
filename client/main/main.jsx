'use strict';

const React = require('react');
const Headtags = require('vitreum/headtags');

// components
const Menu = require('./menu.jsx');
//const Game = require('./game.jsx');

const Main = React.createClass({

	render: function() {
		return <main>
			<Headtags.title>The Ohms</Headtags.title>
			<Headtags.meta name="description" content="Can you resist?" />

			{/*<Headtags.meta name="viewport" content="width=device-width, initial-scale=1" />*/}

			<Menu />
		</main>;
	},

});

module.exports = Main;
