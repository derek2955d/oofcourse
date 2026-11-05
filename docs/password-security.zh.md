# 修改密码验证

网站“个人中心 → 账号安全”正常改密要求：当前密码、新密码和确认新密码。服务端先用 `getUser()` 确认当前账号，再向同一 Supabase Auth 项目重新验证当前密码；验证返回的用户 ID 必须一致，之后才更新密码。验证客户端不写浏览器会话 Cookie，临时验证会话在 finally 中退出。

新密码至少 12 个字符、最多 128 个字符，两次输入必须一致，且不能与所输入的当前密码相同。Supabase 的实际密码强度和复用规则仍然生效。输入当前密码时总会验证它，不因为近期验证记录而忽略错误密码。

## 忘记密码

现有邮箱重置入口和 PKCE 回调继续使用。普通会话或网址里的 `verified=1` / `recoveryVerified=true` 不构成验证。服务端使用 `auth.getClaims()` 核验的、属于当前用户且未过期的 JWT，并要求 OTP/recovery AMR 时间戳距今不超过 10 分钟。缺失、无时间戳、未来、其他用户或普通 password 方法不能跳过当前密码。

这是近期已验证身份的窗口，不是网站新增的邮件验证码服务；未编造邮件发送/收件成功。Supabase 自身仍决定是否属于可免当前密码的恢复会话。如果提供方返回 current_password_required，表单退回当前密码验证模式；也可重新发送并使用邮箱重置链接。不要通过关闭验证来处理恢复流程问题。

## Supabase 提供方策略（必须另外核验）

应用服务端的验证不能替代 Supabase Auth 直连接口策略。要让直接调用 Auth 的请求也需要当前密码，应在原项目 Authentication → Sign In / Providers → Email 中确认“Require current password when changing password”（或相应的当前密码要求）开启。公开 Management API 的对应字段是 `security_update_password_require_current_password: true`。

“Secure password change”对应 `security_update_password_require_reauthentication`；它只要求较旧的会话再验证，最近 24 小时的会话可免该检查，不能单独替代“当前密码要求”。若面板没有当前密码选项，应由项目拥有者通过受支持的 Supabase 管理配置接口设置，不在浏览器或仓库放管理令牌，也不在聊天发送凭证。

当前执行环境没有 Supabase 管理连接或项目凭证，未读取或修改这些云端策略；不要宣称已经验证阻止了直连 Auth 绕过。无需 SQL migration、DNS 修改或购买套餐。

## 修改后

更新成功后请求 Supabase 全局退出以撤销刷新会话，清理当前浏览器会话，并引导以新密码重新登录。退出失败时明确显示“密码已修改”及手动退出提示，不让用户误以为改密失败。已经签发的 access JWT 不应被描述为立即全部失效；其有效期和提供方的会话规则仍适用。

## 验证范围

本地单元测试验证身份匹配、错误密码不调用更新、密码确认、恢复证明边界。浏览器测试包含真实组件的隔离表单字段、原生必填校验、响应式/无障碍与未登录动作边界，不冒充真实 Supabase 邮箱或账号改密成功。上线前用拥有者的测试账号验证：错误当前密码、正确改密、旧密码拒绝、新密码可登录、邮箱恢复、过期恢复、直连 Auth 缺少当前密码被提供方拒绝。
