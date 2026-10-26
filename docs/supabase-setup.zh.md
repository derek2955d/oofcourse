# 新分类信息平台的开发数据库配置

旧导购站代码已归档。本次需要独立的 Supabase 开发项目，不能在旧商品数据库上执行本目录迁移，也不要混用旧的 admin_users 权限表。

1. 登录 Supabase Dashboard，创建免费开发项目（例如 oofcourse-local-dev）。安全保存数据库密码，不要发送到聊天或提交仓库。
2. 在 SQL Editor 依次执行本项目的所有完整 SQL 文件：
   - `202610230001_classifieds.sql`
   - `202610230002_reference_data.sql`
   - `202610230003_workflows.sql`
   - `202610230004_media.sql`
   - `202610230005_operations.sql`
   - `202610230006_publication_boundary.sql`
   - `202610250007_state_geography.sql`
   - `202610260008_near_manhattan_nj.sql`
   - `202610260009_region_groups.sql`
3. 在 Authentication 设置中保留邮箱验证，并将本地开发地址和受信任的预览地址的 `/auth/confirm` 加入允许的重定向地址。设置符合生产需求的邮件服务与速率限制后再商业上线。
4. 在 API 设置中获取 Project URL 和 Publishable key，安全填入云环境和 Vercel Preview 的 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。重新启动开发任务或重建预览；不要把值发送到聊天。
5. 通过网站注册账号，按邮件完成验证。普通账号仅创建 profiles 记录，没有管理员权限。
6. 如需管理员，从 Authentication Users 复制已验证账号的 User UID，再由可信项目管理员在 SQL Editor 执行：

   ```sql
   insert into public.user_roles(user_id,role)
   values ('替换为管理员完整User-UID','admin')
   on conflict do nothing;
   ```

7. 用该账号访问 `/zh/admin` 或 `/en/admin`。修改网址、表单或客户端存储不能授予管理员角色。

## 图片和权限

迁移创建名为 listing-images 的私有 Storage bucket，限制 JPEG/PNG/WebP 和 4MB 服务端对象大小。上传前浏览器压缩并重新编码原图。只有本人草稿允许写入，公开图片须关联已审核且未到期的信息，短期签名 URL 最长五分钟。

## 自动到期

公开查询本身会排除过期信息，即使定时任务未配置也不会继续显示。可选的到期任务还需服务器端 Service Role key 及随机 CRON_SECRET，调用受保护的 `/api/cron/expire`。不要向浏览器暴露这两项值，不要在 Preview 配置中误用生产数据库。

隔离 SQL 测试的 auth/storage fixtures 仅用于临时 PostgreSQL，不能在真实 Supabase 项目执行。真实邮件验证、登录刷新、Storage API 及完整发布审核链路必须在连接开发项目后再实测。

## 已执行 001–006 后的州级筛选更新

只需在同一个开发项目的 SQL Editor 执行 `supabase/migrations/202610250007_state_geography.sql`，不要重新执行前六份。它新增按州筛选的只读函数和索引，不删除或重建已有表，不添加演示商品、房源或城市。执行成功后，各州可通过已有 locations 管理表添加真实城市、区及社区，state 填美国州代码，city 填真实城市。

更新前，网站保留经过范围校验的纽约数据兼容模式；没有地区的州显示空状态。混合州数据的全州搜索需要此更新，不能通过前端过滤一页结果来替代数据库筛选和分页。

## 添加近曼哈顿的新泽西地区（已执行 001–007 的项目）

只执行 `supabase/migrations/202610260008_near_manhattan_nj.sql`，不要重跑前七份。该增量文件新增 Jersey City、Hoboken、Weehawken、Union City、West New York 五条真实 NJ 地区记录，不删除现有数据，不修改权限，也不创建示例帖子。重复执行不会覆盖已有同 ID 地区的设置。

顶部地区选择器只保留纽约；浏览快捷入口和下拉框整合纽约五大区及 NJ 五地，下拉框按“纽约五大区 / 新泽西·近曼哈顿”分组。选择 NJ 城市时提交真实 `state=NJ`；详细地区仍可用于发布。连接 Supabase 的网站只列数据库中已启用的地区，所以执行本次迁移后 NJ 城市才会出现在测试站的下拉框中。没有执行迁移时，不应认为云端 NJ 地区已经配置成功。

## 可选择的地区分组（已执行 001–008 的项目）

只执行 `supabase/migrations/202610260009_region_groups.sql`，不要重跑前八份。名称可保存为“009 — 地区分组筛选”。它新增只读搜索函数 `search_listings_by_region`，让“新泽西·近曼哈顿”只匹配五个指定城市，在排序、统计和分页之前完成过滤；不创建或删除地区/帖子，不更改管理员角色或写入权限。

“纽约市行政区”使用已有 `nyc` 城市范围，包含五大区及发布时选择的下属本地地区。两个分组仅用于浏览，不作为发布地址。“新泽西·近曼哈顿”的新函数缺失时，页面显示加载错误，不会悄悄扩大为整个 NJ 或假装结果为空。
