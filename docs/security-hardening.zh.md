# 会话与后台概览权限修复

2026-11-02。针对个人数据安全测试确认的 Cookie 硬化和后台概览接口阻断，不修改密码、管理员角色或已有业务记录。

## 会话 Cookie

`lib/supabase/cookie-policy.ts` 为服务器客户端和刷新代理提供同一策略：

- `HttpOnly=true`：页面 JavaScript 不读取会话凭据；认证和 PKCE 回调继续由服务器处理。
- `SameSite=Lax`：保留正常外部邮件回到网站的导航，不改成可能影响回调的 Strict。
- Vercel、HTTPS 请求及 HTTPS 反向代理使用 Secure；Vercel 不会被传入的 HTTP 标头降级。
- 本地 HTTP 可以继续运行生产构建并联调。未设置新的 Cookie 名称、会话时限或全站强制退出。

既有 Cookie 在重新登录或自动刷新时更新标志。预览部署完成后，测试账号可退出再登录以立即应用；不声称所有旧会话在部署瞬间已被重写。正式 HTTPS 的实际标志仍需在有权限访问的预览环境复核。

所有认证仍保持服务端操作。未来若引入 `createBrowserClient`，必须先评审它与 HttpOnly 的兼容性，不能直接退回 JavaScript 可读 Cookie。

## 只执行新的 012 SQL

线上检查发现 `admin_summary` 返回 404 / PGRST202；这可能涉及迁移、执行权限或 API schema cache，不能表述为后台权限测试通过。

经过隔离测试的增量文件：

`supabase/migrations/202611020012_admin_summary_access.sql`

由有权限的项目管理员在正确的 Supabase 分类信息项目中：

1. 打开 SQL Editor → New query。
2. 粘贴这一份文件的完整内容，查询可命名为“012 — 后台概览权限修复”。
3. 执行一次。不要重跑 001–011，也不要复制测试目录中的任何 SQL。
4. 保存执行结果，随后重新验证普通账号调用应被拒绝，以及真实管理员的概览页面。

文件会先检查基础 schema，之后仅创建/替换只读概览函数、收紧函数执行授权并通知 PostgREST 刷新 schema。函数验证 `auth.uid()` 和已有 `private.is_admin()`；匿名账号无执行授权，普通账号返回 `42501 / Administrator required`，已有管理员才获得聚合统计。`search_path` 固定为空。它不会创建表、删除数据、分配管理员或更改 RLS 策略。

此文件可重复执行；不代表旧 005 中的其他运营功能已经配置。没有 SQL 执行连接时，只能完成文件和隔离验证，不能声称线上已经修好。

## 可重复的测试

- `npm test`：包含 HTTP/HTTPS/Vercel 的 Cookie 安全策略回归。
- `npm run test:db`：只使用无网络临时 PostgreSQL 容器；应用全部迁移，再重跑 012，验证匿名/普通账号拒绝、管理员只读结果及原有业务权限。绝不连接线上 Supabase。
- 本地生产构建启动后，`AUTH_TEST_BASE_URL=http://localhost:3120 npm run test:auth-security`：需要安全环境配置的专用 `TEST_USER_EMAIL`、`TEST_USER_PASSWORD`，以及启动服务器所需的 Supabase 连接信息。测试真实登录、HttpOnly、自动刷新、语言切换、匿名隔离和退出，不修改业务记录。

真实账号测试仅允许 loopback 地址，不启用 trace、截图或持久化会话。错误输出只包含阶段，不输出 Playwright 的凭据参数或原始错误栈。不要开启会打印请求参数的调试日志。测试会轮换并退出专用账号的会话，因此不要使用日常主账号。

邮件确认/重置、真实双账号私有文件互访，以及平台端空闲超时/MFA 策略仍需后续验证；本次没有代为开启付费服务或更改这些策略。
