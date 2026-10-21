import type { Locale } from "./config";
export type InfoPage = {
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
};
const pages = {
  about: {
    en: {
      title: "Good finds. Independent thinking.",
      intro:
        "OofCourse is an independent shopping discovery platform for everyday consumers. Great Deals? Of Course!",
      sections: [
        {
          title: "Products first",
          text: "We organize useful products across categories and retailers, so discovering your next favorite takes less searching. Retailers are shopping destinations, not our identity.",
        },
        {
          title: "Clear information",
          text: "Current listings are clearly marked original demo concepts, without live prices or purchasing links. We do not sell products, take payments, ship orders, or handle merchant returns.",
        },
        {
          title: "Independent recommendations",
          text: "Future authorized affiliate links may earn us a commission. Retailer names identify destinations; they do not imply ownership, endorsement, or approved partnerships.",
        },
      ],
    },
    zh: {
      title: "独立发现，认真选择。",
      intro: "OofCourse 是面向消费者的独立综合购物发现平台。好物好价？当然！",
      sections: [
        {
          title: "让商品成为主角",
          text: "我们按分类整理实用商品与购物灵感，让你更轻松地发现下一件心仪好物。零售商是购物去向，不是我们的品牌定位。",
        },
        {
          title: "清楚说明，放心探索",
          text: "目前展示的商品均标为原创演示概念，没有实时价格或购买链接。我们不销售商品、不收款、不配送，也不处理商家的退换货。",
        },
        {
          title: "保持独立",
          text: "未来通过获授权的联盟链接完成符合条件的购买时，我们可能获得佣金。商家名称只用于识别购物去向，不代表官方经营、背书或已批准的合作关系。",
        },
      ],
    },
  },
  contact: {
    en: {
      title: "How can we help?",
      intro:
        "Our public contact channel is being prepared. This preview does not collect messages or personal information.",
      sections: [
        {
          title: "An order or return?",
          text: "OofCourse does not process orders. For future purchases, contact the retailer listed on your receipt for shipping, payments, warranties, and returns.",
        },
        {
          title: "Site feedback and privacy",
          text: "A verified support and privacy contact will be published here before we enable public submissions or live commercial operations. Do not put personal information into search or demo editor fields.",
        },
      ],
    },
    zh: {
      title: "有什么可以帮助你？",
      intro: "公开联系渠道正在准备中，本演示版本不收集留言或个人信息。",
      sections: [
        {
          title: "订单或退换货问题",
          text: "OofCourse 不处理订单。未来如有实际购买，请联系收据上的零售商咨询配送、付款、保修与退换货。",
        },
        {
          title: "网站反馈与隐私",
          text: "在开放公开提交或正式商业运营前，我们会在这里公布经核实的客服与隐私联系渠道。请勿在搜索框或演示编辑器中填写个人信息。",
        },
      ],
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      intro:
        "Updated October 21, 2026. This policy describes the current OofCourse demonstration.",
      sections: [
        {
          title: "Favorites and local workspace",
          text: "Favorites are stored in this browser under oofcourse:saved:v1 and shared between English and Chinese pages. Demo admin edits use oofcourse:admin-demo:v2. They are not sent to a visitor-profile database. Clear favorites, reset the demo workspace, or remove browser site data to delete them. Browser storage may be unavailable and does not synchronize across devices.",
        },
        {
          title: "Accounts and cookies",
          text: "Browsing does not require an account. If an operator configures Supabase, administrator login uses Supabase Auth and necessary session cookies. The demo workspace does not authenticate users. Administrator passwords are never stored in demo records.",
        },
        {
          title: "Hosting and search URLs",
          text: "Hosting providers may process IP addresses, browser details, request paths, timestamps, and logs to deliver and secure the site. Search keywords and filters are in URLs and may appear in browser history or hosting logs. Do not enter sensitive information. Hosting retention must be reviewed before real operations.",
        },
        {
          title: "Analytics and third parties",
          text: "No visitor analytics provider, advertising script, marketing cookie, newsletter collection, or live merchant API is enabled. Future external merchant websites have their own privacy policies. Any future event collection requires a reviewed purpose, applicable notice/consent, retention controls, and no unnecessary personal data.",
        },
        {
          title: "Contact and children",
          text: "A verified privacy contact and operator details must be published before public submission collection. This site supports adult shopping decisions and is not directed to children under 13. Applicable privacy-rights procedures will be reviewed before commercial launch.",
        },
      ],
    },
    zh: {
      title: "隐私政策",
      intro:
        "更新于 2026 年 10 月 21 日。本政策适用于当前 OofCourse 演示版本。",
      sections: [
        {
          title: "收藏与本地工作区",
          text: "收藏保存在当前浏览器的 oofcourse:saved:v1 中，中英文页面共用同一清单。后台演示编辑使用 oofcourse:admin-demo:v2，不会发送到访客档案数据库。你可以清空收藏、重置演示工作区或清除浏览器网站数据。浏览器存储可能不可用，也不会跨设备同步。",
        },
        {
          title: "账号与 Cookie",
          text: "浏览商品无需注册。运营者配置 Supabase 后，管理员登录使用 Supabase Auth 和必要的会话 Cookie。演示工作区不验证用户身份，管理员密码不会存入演示记录。",
        },
        {
          title: "托管服务与搜索地址",
          text: "托管服务商可能处理 IP 地址、浏览器信息、请求路径、时间与日志，以提供网站和安全保障。搜索词和筛选项会出现在网址中，可能保留在浏览历史或托管日志中，请勿输入敏感信息。正式运营前必须审核日志保留规则。",
        },
        {
          title: "统计与第三方服务",
          text: "目前未启用访客统计平台、广告脚本、营销 Cookie、邮箱收集或实时商家 API。未来跳转的商家网站适用其自身隐私政策。新增数据采集前，必须审核用途、适用的告知与同意、保留期限，并避免不必要的个人信息。",
        },
        {
          title: "联系渠道与儿童",
          text: "公开收集提交信息前，必须公布经核实的隐私联系渠道与运营者资料。本网站服务于成年人的购物决策，不面向 13 岁以下儿童。正式商业运营前将审核适用的隐私权请求流程。",
        },
      ],
    },
  },
  "affiliate-disclosure": {
    en: {
      title: "Affiliate Disclosure",
      intro:
        "OofCourse is independent. We may earn a commission from qualifying purchases through clearly disclosed affiliate links.",
      sections: [
        {
          title: "Current demo",
          text: "All current product listings are original demonstration concepts. No live prices, discounts, inventory claims, ratings, promotion deadlines, or purchasing links are connected. We do not claim enrollment in any affiliate program or an approved retailer partnership.",
        },
        {
          title: "Future affiliate recommendations",
          text: "A qualifying purchase through an approved affiliate link may earn us a commission. The relationship will be disclosed near the recommendation and outbound link. Final pricing, availability, delivery, payment, and returns are determined by the retailer.",
        },
        {
          title: "Separate rights for each source",
          text: "Each retailer offer, image, price, and link must have its own authorized source and usage permissions. Content licensed by one retailer must not be reused to divert shoppers to another. We do not scrape retailer pages without permission or invent Verified Deal labels.",
        },
        {
          title: "Amazon Associates statement",
          text: "Upon approved participation, the required statement will be displayed where applicable: “As an Amazon Associate I earn from qualifying purchases.” This reserved statement is not a claim of current membership. Official API, caching, timestamp, material-use and price-display rules must be checked before using that program’s content.",
        },
        {
          title: "Independent destinations",
          text: "OofCourse is not owned, operated, sponsored, or endorsed by a retailer. We do not sell products, take payment, fulfill orders, or handle merchant support. Click counts are not orders or commissions; affiliate earnings must come from official program reports.",
        },
      ],
    },
    zh: {
      title: "联盟披露",
      intro:
        "OofCourse 独立运营。通过明确披露的联盟链接完成符合条件的购买时，我们可能获得佣金。",
      sections: [
        {
          title: "当前演示内容",
          text: "目前商品均为原创演示概念，未接入实时价格、折扣、库存、评分、促销截止时间或购买链接。我们不宣称已加入任何联盟计划或已获得商家合作批准。",
        },
        {
          title: "未来的联盟推荐",
          text: "通过获批准的联盟链接完成符合条件的购买时，我们可能获得佣金。推荐内容及外链附近会清楚披露这一关系。最终价格、库存、配送、支付与退换货以零售商为准。",
        },
        {
          title: "每个来源分别授权",
          text: "每条零售商优惠、图片、价格和链接都必须有可追溯的合法来源与使用权限。不得将某家零售商授权的内容违规用于引导用户前往其他商家。我们不擅自抓取商家页面，也不编造“已核实优惠”标记。",
        },
        {
          title: "Amazon Associates 指定声明",
          text: "正式获准参与后，将按要求在适当位置展示：“As an Amazon Associate I earn from qualifying purchases.” 此处仅预留规定文字，不代表当前已获批准。使用相关内容前必须检查官方 API、缓存、时间戳、素材及价格展示规则。",
        },
        {
          title: "独立平台与购物去向",
          text: "OofCourse 不由任何零售商经营、赞助或背书。我们不销售商品、不收款、不配送，也不承担商家客服。点击次数不等于订单或佣金，联盟收益应以各平台官方报表为准。",
        },
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of Use",
      intro:
        "Use OofCourse to discover shopping ideas and read independent editorial guidance.",
      sections: [
        {
          title: "Discovery, not a checkout",
          text: "OofCourse is not a merchant. Future purchases happen on a retailer’s website under that retailer’s terms. No purchasing offers are active in this demo.",
        },
        {
          title: "Demo and editorial limitations",
          text: "Demo concepts are not real available products or verified discounts. Guides provide general considerations, not individualized safety, medical, financial, or product certification advice. Follow official product instructions and recall guidance.",
        },
        {
          title: "Responsible use",
          text: "Use the site lawfully. Do not misuse accounts, probe unauthorized resources, or republish content without permission. Availability is not guaranteed, and these terms do not limit rights that cannot legally be waived.",
        },
        {
          title: "Local data and launch review",
          text: "Saved finds and demo edits can be lost if browser data is cleared. They do not publish content or create an account. Responsible operator details, verified support, jurisdiction, hosting-plan eligibility, and complete commercial terms must be finalized before real operations.",
        },
      ],
    },
    zh: {
      title: "使用条款",
      intro:
        "OofCourse 提供购物发现与独立编辑内容，帮助你探索更合适的购物选择。",
      sections: [
        {
          title: "发现平台，不是结账平台",
          text: "OofCourse 不是商品卖家。未来购买将在零售商网站完成，并适用其条款。当前演示版本没有有效购买入口。",
        },
        {
          title: "演示与编辑内容的边界",
          text: "演示概念不代表真实在售商品或已核实折扣。指南仅供一般参考，不构成个性化的安全、医疗、财务或产品认证建议。请遵循产品官方说明和召回指引。",
        },
        {
          title: "合理使用",
          text: "请合法使用网站，不滥用账号、不探测未获授权的资源，也不擅自复制发布内容。网站不保证持续可用，本条款不限制法律规定不可放弃的权利。",
        },
        {
          title: "本地数据与上线审核",
          text: "清除浏览器数据可能丢失收藏和演示编辑，这些操作不会发布内容或创建账号。正式运营前必须落实运营者资料、经核实的客服、适用管辖范围、托管套餐资格及完整商业条款。",
        },
      ],
    },
  },
} satisfies Record<string, Record<Locale, InfoPage>>;
export type InfoKey = keyof typeof pages;
export function infoContent(page: InfoKey, locale: Locale): InfoPage {
  return pages[page][locale];
}
