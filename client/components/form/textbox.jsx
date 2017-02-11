'use strict';

const React = require('react');


const Textbox = React.createClass({

	focus: function() {
		this.refs.input.focus();
	},

	render: function() {
		return (
			<div className="textbox">
				<input ref="input" type="text" value={this.props.value} onChange={this.props.onChange} />
			</div>
		);
	},

});

module.exports = Textbox;
