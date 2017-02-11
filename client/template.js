'use strict';

const config = require('nconf');


module.exports = (vitreum) => {
	return (
		`<html>
			<head>${vitreum.head}</head>
			<body>
				<div id="reactRoot">${vitreum.body}</div>
			</body>
			<script>Config = ${JSON.stringify(config.get('client'))};</script>
			${vitreum.js}
		</html>`
	);
};
