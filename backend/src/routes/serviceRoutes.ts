import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';

const router = Router();

router.get('/', ServiceController.getAllServices);
router.get('/search', ServiceController.searchServices);
router.get('/:id', ServiceController.getService);
router.post('/', ServiceController.createService);
router.put('/:id', ServiceController.updateService);
router.delete('/:id', ServiceController.deleteService);

export default router;
