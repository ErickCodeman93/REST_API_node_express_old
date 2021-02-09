const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const Usuario = require('../models/usuario');

const { verificaToken, verificaAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/usuario', verificaToken , (req, res) => {

	let desde = req.query.desde || 0;
	desde = Number( desde );

	let limite = req.query.limite || 5;
	limite = Number( limite );

	Usuario.find( { estado: true }, 'name email estado img role google' )
			.skip(desde)
			.limit(limite)
			.exec( ( err, usuarios ) => {

				if( err ){
					return res.status( 400 ).json({
								ok: false,
								err,
							});	
				} //end if

				Usuario.countDocuments( { estado: true }, ( err, conteo ) => {
					
					res.json({
						ok:true,
						usuarios,
						conteo,
						admin: req.usuario
					});
				});
			} );
	
});
  
app.post('/usuario', [ verificaToken, verificaAdminRole ], (req, res) => {
  
	let body = req.body

	let usuario = new Usuario({
		name : body.name,
		email : body.email,
		password : bcrypt.hashSync( body.password, 10 ),
		role : body.role,
	});

	usuario.save( ( err, usuarioDB ) => {

		if( err )
			return res
					.status( 400 )
					.json({
						ok: false,
						err,
					});	
		

		// usuarioDB.password = null;

		res.json({
			ok:true,
			usuario: usuarioDB,
			admin: req.usuario
		});

	});
  
});
  
app.put('/usuario/:id', [ verificaToken, verificaAdminRole ], (req, res) => {

	let id = req.params.id;

	let body = _.pick( req.body, [ 'name', 'email', 'img', 'role', 'estado'] );

	Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true } ,( err, usuarioDB ) => {

		if( err ){
			return res.status( 400 ).json({
						ok: false,
						err,
					});	
		} //end if

		res.json({
			ok:true,
			usuario: usuarioDB,
			admin: req.usuario
		});
	});

});
  
app.delete('/usuario/:id',[ verificaToken, verificaAdminRole ], (req, res) => {

	let id = req.params.id;

	let estadoC = {
		estado : false
	}

	// Usuario.findByIdAndRemove( id, ( err, user ) => {

	Usuario.findByIdAndUpdate( id, estadoC, { new: true },  ( err, user ) => {

		if( err ){
			return res.status( 400 ).json({
						ok: false,
						err,
					});	
		} //end if

		if( ! user ){
			return res.status( 400 ).json({
						ok: false,
						msg: 'Usuario no encontrado'
					});	
		} //end if

		res.json({
			ok:true,
			usuario: user,
			admin: req.usuario
		});

	} );

});

module.exports = app;