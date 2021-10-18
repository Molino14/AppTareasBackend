const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('es');

const Tarea = require('../models/tarea');
const Usuario = require('../models/usuario');

// Recuperar tareas
async function recuperarTareas(req, res, next) {
    let tareas;
    try {
        tareas = await Tarea.find().populate('id_usuario');
        moment(tareas.fecha_hora).format('LLLL');
    } catch (error) {
        const err = new Error('No se han podido recuperar los datos')
        err.code = 500; // Internal Server Error
        return next(err);
    }
    if (!tareas || tareas.length === 0) {
        const error = new Error('No se han podido encontrar las tareas');
        error.code = 404;
        return next(error);
    } else {
        res.json({
            tareas
        })
    };
}
// Recuperar tareas por ID
async function recuperarTareaPorId(req, res, next) {
    const idTarea = req.params.tid; 
    let tarea;
    try {
        tarea = await Tarea.findById(idTarea).populate('id_usuario');
    } catch (error) {
        const err = new Error('No se han podido recuperar los datos')
        err.code = 500; // Internal Server Error
        return next(err);
    }
    if (!tarea) {
        const error = new Error('No se ha podido encontrar la tarea con esa ID');
        error.code = 404;
        return next(error);
    } else {
        res.json({
            tarea: tarea
        });
    }
}
// Recuperar tareas por ID de usuario
async function recuperarTareasPorIdUsuario(req, res, next) {
    const idUsuario = req.params.uid;
    let tareas;
    try {
        tareas = await Tarea.find({id_usuario: idUsuario});
    } catch (err) {
        const error = new Error('Ha fallado la recuperación. Inténtelo de nuevo más tarde');
        error.code = 500;
        return next(error);
    }
    if (!tareas || tareas.length === 0) {
        const error = new Error('No se han podido encontrar las tareas para el usuario proporcionado');
        error.code = 404;
        next(error);
    } else {
        res.json({
            tareas
        });
    }
}
// Crear tarea
async function crearTarea(req, res, next) {
    const errores = validationResult(req); // Valida en base a las especificaciones en el archivo de rutas para este controller específico
    if (!errores.isEmpty()) {
        const error = new Error('Error de validación. Compruebe sus datos');
        error.code = 422;
        return next(error);
    }
    const {
        id_usuario,
        descripcion
    } = req.body;
    const nuevaTarea = new Tarea({
        id_usuario,
        descripcion
    })
    let usuario; // Localizamos al usuario que se corresponde con el id_usuario que hemos recibido en el request
    try {
        usuario = await Usuario.findById(id_usuario);
    } catch (error) {
        const err = new Error('Ha fallado la creación de la tarea');
        err.code = 500;
        return next(err);
    }
    if (!usuario) {
        const error = new Error('No se ha podido encontrar un usuario con el id proporcionado');
        error.code = 404;
        return next(error);
    }
    if (usuario.id !== req.userData.userId) {
        const err = new Error('No tiene permiso para crear una tarea')
        err.code = 401; // Error de autorización
        return next(err);
    }
    // Inicio de sesión y Transacciones
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await nuevaTarea.save({
            session: sess
        })
        usuario.id_tareas.push(nuevaTarea);
        await usuario.save({
            session: sess
        });
        await sess.commitTransaction();
    } catch (error) {
        const err = new Error('No se han podido guardar los datos');
        err.code = 500;
        return next(err);
    }
    res.status(201).json({
        tarea: nuevaTarea
    });
}
// Modificar tarea
async function modificarTarea(req, res, next) {
    const {descripcion, completada} = req.body;
    const idTarea = req.params.tid;
    let tarea;
    try {
        tarea = await Tarea.findById(idTarea).populate('id_usuario'); // Localizar el pedido en la BDD
    } catch (error) {
        const err = new Error('No se ha podido realizar la operación')
        err.code = 500; // Internal Server Error
        return next(err);
    }
    if (tarea.id_usuario.id !== req.userData.userId) {
        const err = new Error('No tiene permiso para modificar esta tarea')
        err.code = 401; // Error de autorización
        return next(err);
    }
    // Modificamos los datos necesarios
    tarea.descripcion = descripcion;
    tarea.completada = completada;
    // Guardamos los datos modificados en la BDD
    try {
        tarea.save();
    } catch (error) {
        const err = new Error('No se ha podido guardar la tarea actualizada')
        err.code = 500; // Internal Server Error
        return next(err);
    }
    res.status(200).json({
        tarea
    });
}
// Eliminar tarea por ID
async function eliminarTareaPorId(req, res, next) {
    const idTarea = req.params.tid;
    let tarea;
    // Localizar tarea según su ID
    try {
        tarea = await Tarea.findById(idTarea).populate('id_usuario');
    } catch (error) {
        const err = new Error('No se han podido recuperar los datos para eliminación')
        err.code = 500; // Internal Server Error
        return next(err);
    }
    if(!tarea) {
        const error = new Error('No se ha podido encontrar la tarea con el id proporcionado')
        error.code = 404;
        return next(error);
    } else {
        if (tarea.id_usuario.id !== req.userData.userId) {
            const error = new Error('No tiene permiso para eliminar esta tarea')
            error.code = 404;
            return next(error);
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await tarea.remove({session: sess});
            tarea.id_usuario.id_tareas.pull(tarea);
            await tarea.id_usuario.save({session: sess});
            await sess.commitTransaction();
        } catch (error) {
            const err = new Error('Ha habido algún error. No se han podido eliminar los datos')
            err.code = 500; // Internal Server Error
            return next(err);
        }
        res.status(200).json({
            message: 'Tarea eliminada'
        });
    }
}

exports.recuperarTareas = recuperarTareas;
exports.recuperarTareaPorId = recuperarTareaPorId;
exports.recuperarTareasPorIdUsuario = recuperarTareasPorIdUsuario;
exports.crearTarea = crearTarea;
exports.modificarTarea = modificarTarea;
exports.eliminarTareaPorId = eliminarTareaPorId;