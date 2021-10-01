const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Esquema de tarea
const tareaSchema = new Schema({
    descripcion: {
        type: String,
        required: true
    },
    fecha_hora: {
        type: Date, default: Date.now,
        required: true
    },
    completada: {
        type: Boolean,
        default: false
    },
    id_usuario: {
        type: mongoose.Types.ObjectId, // [] --> Si la tarea tiene varios usuarios.
        required: true, 
        ref: 'Usuario'
    }
})

module.exports = mongoose.model('Tarea', tareaSchema);