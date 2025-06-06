import { OneLangProps } from './lang-props';

export const apiLangZhCn: OneLangProps = {
  langName: 'zh-cn',
  langs: {
    'shared:wrong_data': '数据错误',
    'shared:permission_denied': '权限拒绝',

    'shared:name_not_existed': '{name} 不存在',
    'shared:name_not_set': '{name} 未设置',
    'shared:name_is_wrong': '{name} 是错误的',

    'shared:login_success': '登录成功',
    'shared:login_failed': '登录失败',
    'shared:not_logged_in': '未登录',

    'shared:user_not_found': '用户未找到',
    'shared:user_locked': '用户已封锁',

    'shared:wrong_hash': '错误的hash',
    'shared:crypto_key_not_set': 'Crypto key [{cryptoKey}] 未设置',
  },
};
