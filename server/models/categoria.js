const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const uniqueValidator = require('mongoose-unique-validator');

let categoriaSchema = new Schema({
	descripcion: { 
		type: String, 
		unique: true, 
		required: [true, 'La descripción es obligatoria'] 
	},
	usuario: { 
		type: Schema.Types.ObjectId, 
		ref: 'Usuario' 
	}
});

// categoriaSchema.plugin( uniqueValidator,{
// 	message: '{PATH} debe de ser único'
// } );

module.exports = mongoose.model('Categoria', categoriaSchema);