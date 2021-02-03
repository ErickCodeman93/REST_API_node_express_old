const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos = {
	values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
	message:'{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
	name:{
		type: String,
		required: [ true, 'El nombre es necesario' ]
	},
	email:{
		type: String,
		unique: true,
		required: [ true, 'El correo es necesario' ]
	},
	password:{
		type: String,
		required: [ true, 'La contraseña es obligatoria' ]
	},
	img:{
		type: String,
		required: false
	}, // no es obligatoria
	role:{
		type: String,
		default: 'USER_ROLE',
		enum: rolesValidos
	}, //default : 'USER_ROLE'
	estado:{
		type: Boolean,
		default: true
	}, //Boolean
	google:{
		type: Boolean,
		default: false
	}, //Boolean
});

usuarioSchema.method.toJSON = function () {
	
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;

	return userObject;
}

usuarioSchema.plugin( uniqueValidator,{
	message: '{PATH} debe de ser único'
} );

module.exports = mongoose.model( 'Usuario', usuarioSchema );