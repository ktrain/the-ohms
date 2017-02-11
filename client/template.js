'use strict';

const config = require('nconf');


module.exports = (vitreum) => {
	return (
		`<html>
			<head>
				${vitreum.head}
				<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
			</head>
			<body>
				<div id="reactRoot">${vitreum.body}</div>
			</body>
			<script>Config = ${JSON.stringify(config.get('client'))};</script>
			${vitreum.js}
		</html>`
	);
};
