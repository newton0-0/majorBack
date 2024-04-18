const express = require('express');
const router = express.Router();
const multer = require("multer");

const upload = multer();
const imageuploads = upload.fields([
    { name: 'image', maxCount: 1 }, // For files with field name 'image' (maxCount specifies the maximum number of files)
]);

const aiController = require('./aiController');

router.post('/expert-ai', imageuploads, aiController.expertAI);
router.post('/verify-ai', imageuploads, aiController.verifyAI);

router.post('/own-ai', imageuploads, aiController.ownAI);

module.exports = router;