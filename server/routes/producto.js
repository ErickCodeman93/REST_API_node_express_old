const express = require( 'express' );
const { verificaToken } = require( '../middlewares/auth' );

const app = express();
const Producto = require( '../models/producto' );

// ================================
// Obtener productos
// ================================
app.get( '/productos', verificaToken, ( req, res ) => {

	let desde = req.query.desde || 0;
	desde = Number( desde );

	let limite = req.query.limite || 0;
	limite = Number( limite );


	Producto
	.find({ available: true })
	.skip( desde )
	.limit( limite )
	.populate( 'usuario', 'name email' )
	.populate( 'categoria', 'descripcion' )
	.exec( ( err, producto ) => {

		if( err )
		return res
		.status( 500 )
		.json({
			ok: false,
			err,
		});	

		if( !producto )
			return res
				.status( 400 )
				.json({
					ok: false,
					err,
				});

		res.json({
			ok: true,
			producto
		});

	});
});

// ================================
// Obtener productos por ID
// ================================
app.get( '/productos/:id', verificaToken, ( req, res ) => {

	let id = req.params.id;

	Producto
	.findById( id )
	.populate( 'usuario', 'name email' )
	.populate( 'categoria', 'descripcion' )
	.exec( ( err, producto ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});


		if( ! producto )
			return res
			.status( 400 )
			.json({
				ok: false,
				err: {
					message: 'El ID no es correcto'
				}
			});


			res.json({
				ok: true,
				producto,
			}); 
	} );
	
});

// ================================
// Buscar productos 
// ================================
app.get( '/productos/buscar/:termino', verificaToken, ( req, res ) => {

	let termino = req.params.termino;
	let regex = new RegExp( termino, 'i' );
	
	Producto
	.find({ name: regex })
	.populate( 'categoria', 'descripcion' )
	.exec( ( err, producto ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	

		res.json({
			ok:true,
			producto,
		});
	});

} );

// ================================
// Insertar productos
// ================================
app.post( '/productos', verificaToken, ( req, res ) => {

	let body = req.body;

	let productos = new Producto({
		name: body.name,
		precioUni: body.precioUni, 
		descripcion: body.descripcion, 
		available: body.available, 
		categoria: body.categoria_id,
		usuario: req.usuario._id
	});

	productos.save( ( err, producto ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	

		if( !producto )
			return res
				.status( 400 )
				.json({
					ok: false,
					err,
				});	

		res.json({
			ok: true,
			producto
		});

	} );
	
});

// ================================
// Actualizar productos
// ================================
app.put( '/productos/:id', verificaToken, ( req, res ) => {

	let id = req.params.id;
	let body = req.body;

	Producto.findById( id, ( err, producto ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});


		if( ! producto )
			return res
			.status( 500 )
			.json({
				ok: false,
				err: {
					message: 'El ID no es correcto'
				}
			});


			producto.name = body.name || producto.name; 
			producto.precioUni = body.precioUni || producto.precioUni; 
			producto.descripcion = body.descripcion || producto.descripcion;
			producto.available = body.available || producto.available;
			producto.categoria = body.categoria || producto.categoria;
			
			producto.save( ( err, save ) => {

				if( err )
					return res
					.status( 500 )
					.json({
						ok: false,
						err,
					});

				res.json({
					ok: false,
					save,
				});

			} );
	} );
	
});

// ================================
// Borrar productos
// ================================
app.delete( '/productos/:id', verificaToken, ( req, res ) => {
	//solo cambiar el estado de disponible a false
	let id = req.params.id;

	let available = {
		available: false
	}

	Producto.findByIdAndUpdate( id, available, { new: true, runValidators: true }, ( err, producto ) => {

		if( err )
			return res
			.status( 500 )
			.json({
				ok: false,
				err,
			});	

		if( ! producto )
			return res
				.status( 400 )
				.json({
					ok: false,
					err,
				});	

		res.json({
			ok: true,
			producto
		});
	});
	
});


module.exports = app;

