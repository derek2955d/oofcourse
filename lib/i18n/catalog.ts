import type { Locale } from "./config";
import type { Product, Category } from "../data";
const names: Record<string, string> = {
  home: "家居与厨房",
  tech: "数码电子",
  toys: "玩具与儿童",
  baby: "母婴用品",
  beauty: "美妆与个护",
  outdoors: "运动与户外",
  pets: "宠物用品",
  essentials: "日常必需品",
  fashion: "时尚穿搭",
};
const productNames = [
  "日常手冲咖啡套装",
  "周日陶瓷马克杯套装",
  "录音室风格无线耳机",
  "口袋蓝牙音箱",
  "小小建筑师积木套装",
  "周末绘画工具套装",
  "柔软棉质婴儿毯",
  "成长叠叠杯",
  "日常个护收纳盒",
  "晨间化妆刷套装",
  "山径轻行双肩包 · 22升",
  "日常保温随行杯",
  "舒适宠物床",
  "欢乐编绳玩具",
  "可重复使用购物袋",
  "日常收纳篮",
];
export const categoryName = (c: Category, locale: Locale) =>
  locale === "zh" ? names[c.slug] || c.name : c.name;
export const productName = (p: Product, locale: Locale) =>
  locale === "zh" ? p.nameZh || p.name : p.name;
export const productDescription = (p: Product, locale: Locale) =>
  locale === "zh" ? p.descriptionZh || p.description : p.description;
export const categoryChinese = names;
export const demoChineseNames = productNames;
export const featureText = (p: Product, locale: Locale) =>
  locale === "zh"
    ? [
        "用于展示购物发现体验的原创概念",
        "结合尺寸、材质和使用场景做选择",
        "购买前核对商家条款及产品安全信息",
      ]
    : p.features;
