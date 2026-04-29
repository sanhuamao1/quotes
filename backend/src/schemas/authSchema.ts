import Joi from 'joi';

export const authSchema = {
  login: {
    body: Joi.object({
      code: Joi.string().required().messages({
        'string.empty': '微信登录 code 不能为空',
        'any.required': '微信登录 code 是必填项',
      }),
    }),
  },
};
