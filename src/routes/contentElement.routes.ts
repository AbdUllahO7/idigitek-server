import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import ContentElementController from '../controllers/ContentElement.controller';

const router = express.Router();



// ContentElement routes

// Base routes for content elements
router.post('/', authenticate, ContentElementController.createContentElement);

// More specific routes must come before wildcard routes
router.put('/order', authenticate, ContentElementController.updateElementsOrder);
router.get('/subsection/:subsectionId', ContentElementController.getContentElementsBySubsection);



// Routes with the :id parameter should come last
router.get('/:id', ContentElementController.getContentElementById);
router.put('/:id', authenticate, ContentElementController.updateContentElement);
router.delete('/:id', authenticate, ContentElementController.deleteContentElement);

export default router;