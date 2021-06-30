// uploads folder manage
const fs = require("fs");
const multer = require("multer");
const path = require("path");

multer({ dest: "/uploads" });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync('./uploads')) {
                fs.mkdirSync('./uploads', {recursive: true})
            }
			cb(null, "uploads/");
		},
		filename: (req, file, cb) => {
			cb(null, new Date().valueOf() + path.extname(file.originalname));
		},
	}),
});

module.exports = upload;
