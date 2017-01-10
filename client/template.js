'use strict';

module.exports = (vitreum) => {
	return (
		`<html>
			<head>${vitreum.head}</head>
			<body>
				<div id="reactRoot">${vitreum.body}</div>
			</body>
			${vitreum.js}
		</html>`
	);
};
