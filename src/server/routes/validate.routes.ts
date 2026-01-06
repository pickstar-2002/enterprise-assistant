/**
 * 密钥验证路由
 * 用于验证用户输入的 API 密钥是否有效
 */
import { Router, Request, Response } from 'express';
import ModelScopeService from '../services/modelscopeService';

const router = Router();

/**
 * POST /api/validate-keys
 * 验证 API 密钥的有效性
 *
 * 请求体:
 * {
 *   "modelscopeApiKey": string  // 魔搭 API 密钥
 * }
 *
 * 响应:
 * {
 *   "valid": boolean,
 *   "modelscope": {
 *     "valid": boolean,
 *     "error"?: string
 *   }
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { modelscopeApiKey } = req.body;

    // 验证必填字段
    if (!modelscopeApiKey) {
      return res.status(400).json({
        valid: false,
        error: '请提供 ModelScope API 密钥'
      });
    }

    // 验证 ModelScope 密钥
    let modelscopeValid = true;
    let modelscopeError: string | undefined;

    if (modelscopeApiKey) {
      try {
        const modelScopeService = new ModelScopeService(modelscopeApiKey);
        const result = await modelScopeService.validateApiKey();

        modelscopeValid = result.valid;
        if (!result.valid) {
          modelscopeError = result.error;
        }
      } catch (error: any) {
        modelscopeValid = false;
        modelscopeError = error.message || 'ModelScope 密钥验证失败';
      }
    }

    // 整体结果
    const overallValid = modelscopeValid;

    return res.json({
      valid: overallValid,
      modelscope: {
        valid: modelscopeValid,
        error: modelscopeError
      }
    });
  } catch (error: any) {
    console.error('[Validate Keys] Error:', error);
    return res.status(500).json({
      valid: false,
      error: error.message || '验证过程中发生错误'
    });
  }
});

export default router;
