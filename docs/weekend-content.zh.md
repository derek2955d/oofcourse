# 周末好去处

`/zh/weekend`、`/en/weekend` 是独立的原创出游指南栏目，六大投稿分类不变，不新增虚假的活动或用户投稿。现有六篇编辑指南存于 `lib/weekend.ts`，随 GitHub 预览部署更新。新增投稿存入 Supabase 的 community/outings，通过网页上传、个人中心编辑及后台审核维护，不需要逐篇改代码；不自动采集商家图片或活动日历。

首批六处：Governors Island、Liberty State Park、The Met Cloisters、Rockaway Beach、Brooklyn Botanic Garden、Dia Beacon。玩法与地区筛选可组合，空结果可清除；详情包含原创行程建议、交通准备、注意事项、官方访客页面和主动打开的 Google Maps 搜索链接。地图不嵌入，不请求定位权限。

## 信息边界及来源核查（2026-10-29）

这是目的地灵感，不是某个周日必定开放、有票或免费入场的承诺。没有列实时票价、余票、评分、固定行程时长、花期或实时天气。所有场地使用自制渐变和图标，不转载照片或完整文章。出发前应核对当前主办方/场地规则。

本轮可直接读取的公开参考：
- The Met 官方访客页：https://www.metmuseum.org/plan-your-visit/met-cloisters
- NYC Tourism 洛克威：https://www.nyctourism.com/attractions-tours/rockaway-beach/
- NYC Tourism 总督岛：https://www.nyctourism.com/attractions-tours/governors-island/
- NYC Tourism 自由州立公园：https://www.nyctourism.com/attractions-tours/liberty-state-park/
- NYC Tourism 布鲁克林植物园：https://www.nyctourism.com/attractions-tours/brooklyn-botanic-garden/

官方 Governors Island 页面本轮超时；BBG 和 Dia 访客页返回 403；NJDEP 页面返回较短的脚本页面。未绕过这些限制，也不声称读取或核验了它们当前营业/预约安排。Dia Beacon 的笔记只保留场地与城市等基本事实和一般出行准备，不宣称核验了当日营业情况；运营前应人工复查各官方入口。外部来源可访问不等于获得照片或文章转载许可。

新目的地需补齐中英文内容、真实所在地及官方入口，核对来源后再发布。不在商品数据库中伪造地点、商家或用户。新增投稿功能需执行 migration 010；日常新增/编辑投稿无需再写 SQL，也无需新的付费服务。


## 自助投稿

1. 执行 `supabase/migrations/202610290010_weekend_submissions.sql`，可命名“010 — 周末好去处投稿”。已执行 001–009 的项目只运行这一份。
2. 在周末栏目点击“分享一个好去处”，登录自己的账号。填写标题、主题、具体地点、玩法和介绍。当前支持 NYC 地区、已开放的五个 NJ 城市，以及新增的真实 Beacon 地区；投稿区域由实际地区记录推导，不能手填伪造。
3. 保存草稿后使用已有照片步骤上传本人拍摄或获授权的 JPG/PNG/WebP 照片（最多 8 张、每张输入不超过 4 MiB；客户端压缩及服务端转码仍适用）。照片在草稿阶段为私有。
4. 提交审核；拥有者可在个人中心找到自己的草稿和待审核记录。管理员在已有待审核队列审阅后发布。普通会员不能直接公开发布或自行取得管理员角色。编辑已发布内容会重新走草稿/审核。
5. 审核通过且未过期的投稿进入栏目“大家分享”，可按玩法和地区筛选、分页，打开现有社区详情页查看照片、收藏或联系发布者。文字保留作者原语言，不伪造翻译。原有代码维护的六篇指南继续保留，暂不自动转换为用户帖子或虚构作者。

Migration 010 只新增 outing 子分类、Beacon 地区及出游字段约束，不删除现有帖子或改变 RLS/管理员权限；已有结构化字段白名单扩展仅针对 outings。出游帖子不作为票务报价，price 由服务端及数据库归一化为空。上线环境未执行迁移时，投稿入口显示配置提示，避免把出游误投到其他类型。

本环境没有 Supabase 配置/管理执行权限；隔离 PostgreSQL 验证通过不等于已完成云端真实账号、图片上传、管理员审核与公开展示的全链路联调。执行迁移后需用实际测试账号点验。
