const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/auth');

let app = express();

let Categoria = require( '../models/categoria' );

// =====================================
// Mostrar todas las categorías
// =====================================

app.get( '/categoria', verificaToken,( req, res ) => {

	Categoria.find({})
			.sort( 'descripcion' )
			.populate( 'usuario', 'name email' )
			.exec( ( err, categorias ) => {

				if( err )
					return res
					.status( 500 )
					.json({
						ok: false,
						err,
					});
					
				res.json({
					ok: true,
					categorias
				});

			} );
} );

// =====================================
// Mostrar una categoría por ID
// =====================================

app.get( '/categoria/:id', verificaToken,( req, res ) => {

	let id = req.params.id;

	Categoria.findById( id, ( err, categoria ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});


		if( ! categoria )
			return res
			.status( 500 )
			.json({
				ok: false,
				err: {
					message: 'El ID no es correcto'
				}
			});


			res.json({
				ok: true,
				categoria
			}); 
	} );

} );

// =====================================
// Crear nueva categoría
// =====================================

app.post( '/categoria', verificaToken ,( req, res ) => {

	let body = req.body;

	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario : req.usuario._id
	});

	categoria.save( ( err, categoriaDB ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	

		if( !categoriaDB )
			return res
				.status( 400 )
				.json({
					ok: false,
					err,
				});	

		res.json({
			ok: true,
			categoria: categoriaDB
		});
		
	} );

} );

// =====================================
// Actualizar categoría
// =====================================

app.put( '/categoria/:id', verificaToken ,( req, res ) => {

	let id = req.params.id;
	let body = req.body;
	let decsCategoria = { descripcion: body.descripcion };

	Categoria.findByIdAndUpdate( id, decsCategoria, { new: true, runValidators: true }, ( err, categoriaDB ) => {
		
		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	

		if( !categoriaDB )
			return res
				.status( 400 )
				.json({
					ok: false,
					err,
				});	

		res.json({
			ok: true,
			categoria: categoriaDB
		});

	} );

} );

// =====================================
// Borrar categoría
// =====================================

app.delete( '/categoria/:id', [ verificaToken, verificaAdminRole ],( req, res ) => {

	let id = req.params.id;

	Categoria.findByIdAndRemove( id, ( err, categoria ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	
		

		if( ! categoria )
			return res
			.status( 400 )
			.json({
				ok: false,
				msg: 'Usuario no encontrado'
			});	

		res.json({
			ok:true,
			usuario: categoria,
			admin: req.usuario
		});

	} );
	

} );

module.exports = app;