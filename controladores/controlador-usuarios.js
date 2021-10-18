const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario"); // Importación del esquema usuario.

// Recuperar usuarios
async function recuperarUsuarios(req, res, next) {
	console.log("Recibido GET desde raiz");
	let usuarios;
	try {
		usuarios = await Usuario.find({}, "-password").populate("id_tareas"); // ({}, '-password') Muestra todos los atributos de los objetos menos el password.
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuarios || usuarios.length === 0) {
		const error = new Error("No se han podido encontrar los usuarios");
		error.code = 404;
		return next(error);
	} else {
		res.json({
			usuarios,
		});
	}
}
// Recuperar usuario por ID
async function recuperarUsuariosPorId(req, res, next) {
	console.log("Recibido GET por ID");
	const idUsuario = req.params.uid;
	let usuario;
	try {
		usuario = await Usuario.findById(idUsuario);
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuario) {
		const error = new Error("No se ha podido encontrar el usuario con esa ID");
		error.code = 404;
		return next(error);
	} else {
		res.json({
			usuario,
		});
	}
}
// Recuperar usuario por nombre
async function recuperarUsuariosPorNombre(req, res, next) {
	console.log("Recibido GET por nombre");
	const nombreUsuario = req.params.unombre;
	let usuarios;
	try {
		usuarios = await Usuario.find({ nombre: nombreUsuario });
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuarios || usuarios.length === 0) {
		const error = new Error("No se ha podido encontrar el usuario con ese nombre");
		error.code = 404;
		return next(error);
	} else {
		res.json({
			usuarios,
		});
	}
}
// Recuperar usuario por email
async function recuperarUsuarioPorEmail(req, res, next) {
	console.log("Recibido GET por email");
	const emailUsuario = req.params.uemail;
	let usuario;
	try {
		usuario = await Usuario.findOne({ email: emailUsuario });
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuario) {
		const error = new Error("No se ha podido encontrar el usuario con ese email");
		error.code = 404;
		return next(error);
	} else {
		res.json({
			usuario,
		});
	}
}
// Eliminar usuario por ID
async function eliminarUsuarioPorId(req, res, next) {
	const idUsuario = req.params.uid;
	let usuario;
	try {
		usuario = await Usuario.findByIdAndRemove(idUsuario);
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuario) {
		const error = new Error("No existe el usuario con ese ID");
		error.code = 404;
		return next(error);
	} else {
		return res.status(200).json({
			message: "Usuario eliminado por ID",
		});
	}
}
// Eliminar usuario por email
async function eliminarUsuarioPorEmail(req, res, next) {
	const emailUsuario = req.params.uemail;
	let usuario;
	try {
		usuario = await Usuario.findOneAndRemove({ email: { $eq: emailUsuario } });
	} catch (error) {
		console.log(error);
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!usuario) {
		const error = new Error("No existe el usuario con ese e-mail");
		error.code = 404;
		return next(error);
	} else {
		return res.status(200).json({
			message: "Usuario eliminado por e-mail",
		});
	}
}
// Crear usuario
async function crearUsuario(req, res, next) {
	const errores = validationResult(req);
	if (!errores.isEmpty()) {
		const error = new Error("Error de validación. Compruebe sus datos.");
		error.code = 422;
		return next(error);
	}
	const { nombre, apellidos, email, password } = req.body;
	// Lo mismo que hacer ==> const nombre = req.body.nombre;
	let existeUsuario;
	try {
		existeUsuario = await Usuario.findOne({ email: email });
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (existeUsuario) {
		const error = new Error("Ya existe un usuario con ese e-mail");
		error.code = 401; // 401 Fallo de autentificación.
		return next(error);
	} else {
		// Hashing password
		let hashedPassword;
		try {
			hashedPassword = await bcrypt.hash(password, 10);
		} catch (error) {
			const err = new Error("No se ha podido crear el usuario. Inténtelo de nuevo");
			err.code = 500; // Internal Server Error
			return next(err);
		}
		const nuevoUsuario = new Usuario({
			nombre: nombre.trim(),
			apellidos: apellidos.trim(),
			email: email.trim(),
			password: hashedPassword
		});
		try {
			await nuevoUsuario.save();
		} catch (error) {
			const err = new Error("No se han podido guardar los datos");
			err.code = 500; // Internal Server Error
			return next(err);
		}
		// Creación del token.
		let token;
		try {
			token = jwt.sign(
				{
					userId: nuevoUsuario.id,
					email: nuevoUsuario.email,
				},
				process.env.JWT_KEY,
				{ expiresIn: "1h" }
			);
		} catch (error) {
			const err = new Error("El proceso de crear un usuario ha fallado");
			err.code = 500; // Internal Server Error
			return next(err);
		}
		res.status(201).json({
			userId: nuevoUsuario.id,
			email: nuevoUsuario.email,
			token: token,
		});
		console.log("Usuario creado.");
	}
}
// Modificar usuario
async function modificarUsuario(req, res, next) {
	const errores = validationResult(req);
	if (!errores.isEmpty()) {
		const error = new Error("Error de validación. Compruebe sus datos.");
		error.code = 422;
		return next(error);
	}
	const { nombre, apellidos, email, password } = req.body; // Sacamos del body del request las propiedades que queremos modificar
	const idUsuario = req.params.uid;
	let usuario;
	try {
		usuario = await Usuario.findById(idUsuario);
		existeEmail = await Usuario.findOne({ email });
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!existeEmail) {
		console.log("No existe emails");
	} else if (existeEmail.email && existeEmail.email !== usuario.email) {
		const err = new Error("Este email ya esta en uso");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	// Hasheamos la password.
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 10);
	} catch (error) {
		const err = new Error("No se ha podido crear el usuario. Inténtelo de nuevo");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	// Modificamos nombre, apellidos, email, password.
	usuario.nombre = nombre;
	usuario.apellidos = apellidos;
	usuario.email = email;
	usuario.password = hashedPassword;
	// Guarda los datos modificados en la BDD.
	try {
		usuario.save();
	} catch (error) {
		const err = new Error("No se ha podido guardar la información actualizada");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	// Devolvemos mensaje de estado OK y el usuario modificado.
	res.status(200).json({
		usuario: usuario,
	});
	console.log("Usuario modificado");
}
// Login del cliente
async function loginUsuario(req, res, next) {
	const { email, password } = req.body;
	// Buscamos si existe un usuario.
	let existeUsuario;
	try {
		existeUsuario = await Usuario.findOne({ email: email });
	} catch (error) {
		const err = new Error("No se han podido recuperar los datos");
		err.code = 500; // Internal Server Error
		return next(err);
	}
	if (!existeUsuario) {
		const error = new Error("No se ha podido identificar al usuario. Credenciales erróneas");
		error.code = 422; // 422: Datos de usuario inválidos
		return next(error);
	} else {
		let esValidoElPassword = false;
		try {
			esValidoElPassword = await bcrypt.compare(password, existeUsuario.password);
		} catch (error) {
			const err = new Error("No se ha podido realizar el login. Revise sus credenciales");
			err.code = 500; // 500: Internal Server Error.
			return next(error);
		}
		if (!esValidoElPassword) {
			const error = new Error("No se ha podido identificar al usuario. Credenciales erróneas");
			error.code = 401; // 401: Fallo de autentificación.
			return next(error);
		} else {
			// Creación del token para firmar.
			let token;
			try {
				token = jwt.sign({ 
					idUsuario: existeUsuario.id,
					email: existeUsuario.email 
				}, process.env.JWT_KEY, { expiresIn: "1h" }); // Uso de variable de entorno
			} catch (error) {
				const err = new Error("El proceso de login ha fallado");
				err.code = 500; // Internal Server Error
				return next(err);
			}
			res.json({
				userId: existeUsuario.id,
				nombre: existeUsuario.nombre,
				apellidos: existeUsuario.apellidos,
				email: existeUsuario.email,
				token: token,
			});
		}
	}
	console.log("Usuario logeado");
}

exports.recuperarUsuarios = recuperarUsuarios;
exports.recuperarUsuariosPorId = recuperarUsuariosPorId;
exports.recuperarUsuariosPorNombre = recuperarUsuariosPorNombre;
exports.recuperarUsuarioPorEmail = recuperarUsuarioPorEmail;
exports.eliminarUsuarioPorId = eliminarUsuarioPorId;
exports.eliminarUsuarioPorEmail = eliminarUsuarioPorEmail;
exports.crearUsuario = crearUsuario;
exports.modificarUsuario = modificarUsuario;
exports.loginUsuario = loginUsuario;