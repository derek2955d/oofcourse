# 连接独立 Supabase 开发项目

这一步用于真实管理员登录及数据库编辑。当前公开商品仍使用演示适配器；保存数据库记录不会自动变成公开优惠。

1. 打开 https://supabase.com/dashboard ，登录后选择 **New project**。项目可命名 `oofcourse-dev`。选择免费方案；若界面要求付费，请先停止。数据库密码通过密码管理器保存，不要发到聊天或提交 Git。
2. 项目创建完成后，打开 **SQL Editor → New query**。按顺序分别复制并执行仓库中的以下完整文件，每次成功后再执行下一个：
   - `supabase/migrations/202610210001_initial_schema.sql`
   - `supabase/migrations/202610210002_multi_retailer.sql`
   - `supabase/migrations/202610210003_bilingual_offers.sql`
   不要执行 `tests/database/auth-fixture.sql`；它仅供隔离测试使用。已执行的迁移不要重复运行，也不要在其他网站的数据库执行。
3. 打开 **Authentication → Users → Add user / Create new user**，创建你的管理员账号，使用强密码。确认邮箱后，复制该用户的 **User UID**。如果创建界面只有邀请功能，按邮件完成账号激活。
4. 在 SQL Editor 执行下面的语句，将示例 UUID 替换为刚才的 User UID（不是邮箱）：

   ```sql
   insert into public.admin_users (user_id, role)
   values ('替换为管理员的完整User-UID', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

   只有可信项目管理员可执行这一步。网站不允许用户自行授予管理员权限。
5. 在项目 **Settings → API / API Keys** 找到 **Project URL** 和 **Publishable key**。界面名称可能略有变化；URL 通常是 `https://项目标识.supabase.co`，新式 publishable key 以 `sb_publishable_` 开头。不要选择 Secret / Service Role key。
6. 在 Codex 云环境设置的环境变量中添加：

   ```text
   NEXT_PUBLIC_SUPABASE_URL=你的Project URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的Publishable key
   ```

   保存并发布环境配置，启动使用新配置的任务。不要在聊天中粘贴任何密钥或密码。Vercel 预览是独立环境，还需要在 **Project → Settings → Environment Variables** 添加这两个值，仅选择 **Preview**，然后重新部署预览；不要顺带修改 Production。
7. 打开预览的 `/zh/admin` 或 `/en/admin`，使用步骤 3 的账号登录。若仍出现本地演示工作区，部署没有读到两个环境变量；若登录后仍不能读取记录，检查迁移是否全部成功、UID 是否正确、角色是否为 `admin`。

## 验证边界

管理员可以维护商品双语描述、分类、零售商、来源、报价及联盟链接。未经授权的用户没有写入权限，管理员身份由服务端和 RLS 共同检查。发布报价还要求真实来源、内容授权、批准的商家域名、有效链接及近期核验。

本仓库的隔离数据库测试不等于已验证你的 Supabase 项目。连接后仍需实测登录、退出、会话刷新、非管理员拒绝、编辑与审核。真实公开数据适配器、授权数据接入和定时过期检查尚需完成，不能仅把演示记录切换为 published 就上线。
