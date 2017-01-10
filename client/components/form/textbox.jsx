'use strict';

const React = require('react');


const Textbox = React.createClass({

	render: function() {
		return (
			<div className="textbox">
				<input type="text" />
			</div>
		);
	},

});

module.exports = Textbox;
