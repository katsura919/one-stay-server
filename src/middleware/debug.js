// Debug middleware to log form data
const logFormData = (req, res, next) => {
    console.log('=== Form Data Debug ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    } : 'No file');
    console.log('======================');
    next();
};

module.exports = { logFormData };
