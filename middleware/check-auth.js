const jwt = require("jsonwebtoken");

function autentificacion(req, res, next) {
	try {
		const token = req.headers.authorization.split(" ")[1];
		if (!token) {
			console.log("No hay token");
			throw new Error("Fallo de autentificación");
		} else {
			decodedToken = jwt.verify(token, process.env.JWT_KEY);
			req.userData = {
				userId: decodedToken.idUsuario
			};
			next();
		}
	} catch (error) {
		console.log("La extracción del token de seguridad falló");
		const err = new Error("Fallo de autentificación");
		err.code = 401;
		return next(err);
	}
}

module.exports = autentificacion;
/* headers {
    Authorization: 'Bearer' + token;
} */
