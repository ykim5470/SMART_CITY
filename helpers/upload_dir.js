// uploads folder manage
const multer = require("multer");
const path = require('path');

const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/");
		},
		filename: (req, file, cb) => {
			cb(null, new Date().valueOf() + path.extname(file.originalname));
		},
	}),
});


module.exports = upload