import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';

const router = Router();

router.get('/', SubscriptionController.getAllSubscriptions);
router.get('/search', SubscriptionController.searchSubscriptions);
router.get('/expiring-soon', SubscriptionController.getExpiringSoon);
router.get('/user/:userId', SubscriptionController.getUserSubscriptions);
router.get('/:id', SubscriptionController.getSubscription);
router.post('/', SubscriptionController.createSubscription);
router.put('/:id', SubscriptionController.updateSubscription);
router.post('/:id/cancel', SubscriptionController.cancelSubscription);
router.delete('/:id', SubscriptionController.deleteSubscription);
router.post('/auto-renew/process', SubscriptionController.processAutoRenew);
router.post('/update-expired', SubscriptionController.updateExpiredStatus);

export default router;
