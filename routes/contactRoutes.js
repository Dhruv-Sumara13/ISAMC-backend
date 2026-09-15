import express from 'express';
import { sendContactMessage, sendMembershipApplication, submitPaper } from '../controller/contactController.js';
import multer from 'multer';
import { validateContact, handleValidationErrors } from '../middleware/validation.js';
import { optionalUserAuth } from '../middleware/userAuth.js';

const contactRouter = express.Router();

contactRouter.post('/send-message', validateContact, handleValidationErrors, sendContactMessage);
contactRouter.post('/send-membership-application', optionalUserAuth, sendMembershipApplication);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  }
});

contactRouter.post('/submit-paper', upload.single('pdf'), submitPaper);

export default contactRouter;
