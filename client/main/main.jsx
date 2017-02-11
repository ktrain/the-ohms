'use strict';

const React = require('react');
const _ = require('lodash');
const Headtags = require('vitreum/headtags');

// data
const Store = require('data/store');
const Actions = require('data/actions');

// pages
const NameAgent = require('main/nameAgent/nameAgent.jsx');
const Menu = require('main/menu/menu.jsx');
const Game = require('main/game/game.jsx');


const Main = React.createClass({

	getDefaultProps: function() {
		return {
			pageState: 'NameAgent',
			player: null,
			games: null,
			gameState: null,
		};
	},

	componentDidMount: function() {
		if (!this.props.player) {
			console.log('no player');
			// go to default NameAgent page
			return;
		}
		Actions.getPlayer(this.props.player.id)
			.then((player) => {
				console.log('fetched player');
				if (player.gameId) {
					console.log('player has game ID; connecting');
					Actions.connectAndJoinGame(player.gameId);
				} else {
					console.log('no game; going to menu');
					return Actions.setPageState('Menu');
				}
			})
			.catch((err) => {
				console.error(err);
				return Actions.setPageState('NameAgent');
			});
	},

	componentWillReceiveProps: function(nextProps) {
		if (!this.props.gameState && !!nextProps.gameState) {
			Actions.setPageState('Game');
		}
	},

	renderPage: function() {
		console.log(this.props);
		switch (this.props.pageState) {
			case 'NameAgent':
				return <NameAgent />;
			case 'Menu':
				return <Menu playerName={_.get(this.props.player, 'name')} games={this.props.games} />;
			case 'Game':
				return <Game state={this.props.gameState} />;
			default:
				throw new Error(`Invalid pageState: ${this.props.pageState}`);
		}
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
		pageState: Store.getPageState(),
		player: Store.getPlayer(),
		games: Store.getGames(),
		gameState: Store.getGameState(),
	};
});
