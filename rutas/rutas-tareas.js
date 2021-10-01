const express = require('express');
const {check} = require('express-validator'); // check es un metodo del validator.
const router = express.Router();
const checkAuth = require('../middleware/check-auth'); // Importacion del archivo js de autentificacion.

const controladorTareas = require('../controladores/controlador-tareas');

// Consulta a las tareas.
router.get('/', controladorTareas.recuperarTareas);
// Consulta a las tareas por ID.
router.get('/:tid', controladorTareas.recuperarTareaPorId);
// Consulta a las tareas por ID de usuario.
router.get('/usuarios/:uid', controladorTareas.recuperarTareasPorIdUsuario);
// Protección de rutas.
router.use(checkAuth);
// Eliminar tareas por ID.
router.delete('/:tid', controladorTareas.eliminarTareaPorId);
// Crear nueva tareas.
router.post('/',[
    check('descripcion').not().isEmpty()
] , controladorTareas.crearTarea);
// Modificar tarea.
router.patch('/:tid', controladorTareas.modificarTarea);

module.exports = router;