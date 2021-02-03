const jwt = require('jsonwebtoken');

// ======================================
// Verificar token
// ======================================

const verificaToken = ( req, res, next ) => {

	let token = req.get('token');
	jwt.verify( token, process.env.SEED, ( err, decode ) => {

		if( err )
			return res.status(401).json({
				ok: false,
				err:{
					message: 'Token no válido'
				},
			}); 

		req.usuario = decode.usuario;
		next();

	} );

};

// ======================================
// Verifica Role
// ======================================

const verificaAdminRole = ( req, res, next ) => {

	let usuario = req.usuario;

	if( usuario.role === 'ADMIN_ROLE' )
		next();
	else
		return res.status(401).json({
			ok: false,
			err:{
				message: 'El usuario no es administrador'
			},
		}); 

};

module.exports = { verificaToken, verificaAdminRole };