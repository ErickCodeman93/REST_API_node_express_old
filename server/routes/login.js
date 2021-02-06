const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client( process.env.CLIENT_ID );

const Usuario = require('../models/usuario');

const app = express();

app.post( '/login', ( req, res ) => {

	let body = req.body;

	Usuario.findOne( { email: body.email }, ( err, usuarioDB ) => {

		if( err )
			return res.status( 500 ).json({
						ok: false,
						err,
					});	
	

		if( ! usuarioDB )
			return res.status( 400 ).json({
				ok: false,
				err: {
					msg: 'Usuario o contraseña incorrectos',
					code: '12124123'
				}
			});	

		if( ! bcrypt.compareSync( body.password, usuarioDB.password ) )
			return res.status( 400 ).json({
				ok: false,
				err: {
					msg: 'Usuario o contraseña incorrectos',	
					code: '2324423423'
				}
			});	


		let token = jwt.sign({
			usuario: usuarioDB,
		}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN } );
		
		res.json({
			ok:true,
			usuario: usuarioDB,
			token,
		});
	} );

} );


//configuracion de google
async function verify( token ) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	
	return{
		name: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	}	
	
}
 

app.post( '/google', async( req, res ) => {

	let token = req.body.idtoken;

	let googleUser = await verify( token )
	.catch( e => { 
		return res.status( 403 ).json({
			ok: false,
			err: e,
		});
	});

	Usuario.findOne( { email: googleUser.email }, ( err, usuarioDB ) => {
		
		if( err )
			return res.status( 500 )
			.json({
						ok: false,
						err,
			});
			
		if( usuarioDB ){

			if( usuarioDB.google === false )
				return res.status( 400 ).json({
					ok: false,
					err: {
						message: 'Debe de usar su autenticación normal'
					}
				});
			else{

				let token = jwt.sign({
					usuario: usuarioDB,
				}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN } );

				return res.json({
					ok: true,
					usuario: usuarioDB,
					token
				});

			} //end else
				
			
		} //end if
		else{

			let usuario = new Usuario();

			usuario.name = googleUser.name;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ';)';

			usuario.save( ( err, usuarioDB ) => {

				if( err )
					return res.status( 500 )
					.json({
						ok: false,
						err,
					});

				let token = jwt.sign({
					usuario: usuarioDB,
				}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN } );

				return res.json({
					ok: true,
					usuario: usuarioDB,
					token
				});

			});
		} //end else

	} );

} )

module.exports = app;