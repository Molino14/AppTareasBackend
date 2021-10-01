const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Esquema de usuario
const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    id_tareas: [{
        type: mongoose.Types.ObjectId, 
        ref: 'Tarea'}] 
});

usuarioSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Usuario', usuarioSchema);