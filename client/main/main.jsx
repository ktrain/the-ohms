'use strict';

const React = require('react');
const Headtags = require('vitreum/headtags');

// data
const Store = require('data/store');

// pages
const NameAgent = require('main/nameAgent/nameAgent.jsx');
const GameList = require('main/gameList/gameList.jsx');
//const Game = require('main/game/game.jsx');


const Main = React.createClass({

	getInitialState: function() {
		return {
			player: null,
			games: null,
			gameState: null,
		};
	},

	renderPage: function() {
		if (!this.state.player) {
			return <NameAgent />;
		}
		if (!this.state.gameState) {
			return <GameList games={this.state.games} />;
		}
		//return <Game state={this.state.gameState} />;
	},

	render: function() {
		return (
			<main>
				<Headtags.title>The Ohms</Headtags.title>
				<Headtags.meta name="description" content="Can you resist?" />

				{/*<Headtags.meta name="viewport" content="width=device-width, initial-scale=1" />*/}

				{this.renderPage()}
			</main>
		);
	},

});

module.exports = Store.createSmartComponent(Main, (props) => {
	return {
		player: Store.getPlayer(),
		games: Store.getGames(),
		gameState: Store.getGameState(),
	}
});
