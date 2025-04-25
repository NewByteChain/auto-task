import { Router } from 'express';
import * as mutualController from '../controller/mutualController';

const router = Router();

// 测试方法
router.get('/test', mutualController.getDexData);

// AdsPower http://localhost:9300/api/mutual/api-status
router.get('/api-status', mutualController.apiStatus);

// AdsPower http://localhost:9300/api/mutual/browser-start?user_id=user_hskx5c
router.get('/browser-start', mutualController.browserStart);

// AdsPower http://localhost:9300/api/mutual/browser-stop?user_id=user_hskx5c
router.get('/browser-stop', mutualController.browserStop);

// AdsPower http://localhost:9300/api/mutual/browser-active?user_id=user_hskx5c
router.get('/browser-active', mutualController.browserActive);


// AdsPower 查询分组列表: http://localhost:9300/api/mutual/group-list
router.get('/group-list', mutualController.groupList);

// AdsPower 查询分组列表: http://localhost:9300/api/mutual/group-create?group_name=测试分组&remark=测试分组描述
router.get('/group-create', mutualController.groupCreate);

// AdsPower 查询分组列表: http://localhost:9300/api/mutual/group-update?group_id=5661422&group_name=测试分组&remark=测试分组描述
router.get('/group-update', mutualController.groupUpdate);


// AdsPower 查询分组列表: http://localhost:9300/api/mutual/user-list
router.get('/user-list', mutualController.userlist);

export default router;
