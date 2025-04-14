import express from 'express';
import sectionRoutes from './section.routes';
import sectionElementRoutes from './sectionElement.routes';
import subsectionRoutes from './subSection.routes';

const router = express.Router();

// API routes
router.use('/api/sections', sectionRoutes);
router.use('/api/subsections', subsectionRoutes);
router.use('/api/elements', sectionElementRoutes);

export default router;