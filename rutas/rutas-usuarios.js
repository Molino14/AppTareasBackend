const express = require("express");
const { check } = require("express-validator"); // check es un metodo del validator.
const router = express.Router();
const controladorUsuarios = require("../controladores/controlador-usuarios");
const checkAuth = require("../middleware/check-auth");

// Consulta a los usuarios.
router.get("/", controladorUsuarios.recuperarUsuarios);
// Consulta a los usuarios por ID.
router.get("/:uid", controladorUsuarios.recuperarUsuariosPorId);
// Consulta a los usuarios por nombre.
router.get("/nombre/:unombre", controladorUsuarios.recuperarUsuariosPorNombre);
// Consulta a los usuarios por email.
router.get("/email/:uemail", controladorUsuarios.recuperarUsuarioPorEmail);
// Crear nuevo usuario.
router.post("/",
    check('nombre').not().isEmpty(),
    check('apellidos').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').isLength({min: 6}), controladorUsuarios.crearUsuario);
// Login Usuario.
router.post("/login", controladorUsuarios.loginUsuario);
// Rutas protegidas.
router.use(checkAuth);
// Modificar datos del usuario.
router.patch("/:uid", controladorUsuarios.modificarUsuario);
// Eliminar usuario por email.
router.delete("/delemail/:uemail", controladorUsuarios.eliminarUsuarioPorEmail);
// Eliminar usuario por ID.
router.delete("/:uid", controladorUsuarios.eliminarUsuarioPorId);

module.exports = router;
