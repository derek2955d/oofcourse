export type Guide = {
  slug: string;
  title: string;
  tag: string;
  intro: string;
  image: string;
  color: string;
  category: string;
  readTime: string;
  sections: { title: string; body: string; tips: string[] }[];
};
export const guides: Guide[] = [
  {
    slug: "kitchen-essentials",
    title: "A kitchen that works for your family.",
    tag: "KITCHEN ESSENTIALS",
    intro:
      "Build a useful kitchen around the meals you actually make, not a long list of gadgets you might use someday.",
    image: "coffee",
    color: "#FFF1DF",
    category: "home",
    readTime: "4 min read",
    sections: [
      {
        title: "Start with your real routine",
        body: "Write down the meals you prepared last week. A family that cooks rice nightly needs a different setup from one that mainly roasts vegetables or packs cold lunches. Match new equipment to recurring jobs before buying a specialized tool.",
        tips: [
          "List three tasks that slow dinner down.",
          "Measure drawers and counter space before choosing a size.",
          "Choose a few versatile tools before adding single-use gadgets.",
        ],
      },
      {
        title: "Think beyond the first use",
        body: "Comfortable handles, easy cleaning, and replacement parts matter over time. Look at the manufacturer’s care directions: a beautiful item that requires handwashing may not fit a busy household’s routine. Review materials and heat limits rather than assuming every part is dishwasher-safe.",
        tips: [
          "Check storage, cleaning, and care requirements.",
          "Consider whether children can safely help with the task.",
          "Read warranty and return terms on the retailer’s site.",
        ],
      },
      {
        title: "Make the shortlist, then wait",
        body: "Keep a shortlist of items that solve a specific problem. Compare the total cost, including accessories, shipping, and replacement filters. A lower advertised price is not useful if the product needs extras that strain your budget.",
        tips: [
          "Avoid using a claimed discount as the only reason to buy.",
          "Check current price and availability directly with the retailer.",
          "Our displayed concepts are demo ideas, not tested product recommendations.",
        ],
      },
    ],
  },
  {
    slug: "smart-home-finds",
    title: "A smarter home, without the overwhelm.",
    tag: "SMART HOME FINDS",
    intro:
      "Start with one helpful routine, then build a connected home that your whole household can comfortably use.",
    image: "speaker",
    color: "#EAF4FF",
    category: "tech",
    readTime: "4 min read",
    sections: [
      {
        title: "Choose a problem before a platform",
        body: "A smart device should make something easier: turning off a forgotten lamp, setting a morning timer, or controlling lights with limited mobility. Pick a small, reversible first project. Check voltage, network requirements, and compatibility before you buy.",
        tips: [
          "Check whether your Wi-Fi band is supported.",
          "Confirm compatibility on the manufacturer’s official page.",
          "Keep a reliable manual way to operate essential devices.",
        ],
      },
      {
        title: "Give privacy a place on the checklist",
        body: "Connected devices can process sensitive household information. Review whether a camera or microphone is needed, where data is stored, and whether a subscription is required. Look for supported security updates and a way to delete recordings.",
        tips: [
          "Use unique passwords and multifactor authentication where available.",
          "Review permissions and turn off unnecessary recording.",
          "Keep devices updated using official software.",
        ],
      },
      {
        title: "Count the ongoing cost",
        body: "A device’s price may be only the beginning. Cloud storage, premium automations, batteries, and replacement parts can add recurring expense. Compare the experience with and without a paid subscription.",
        tips: [
          "Budget for optional and required services separately.",
          "Plan how the device behaves during an internet outage.",
          "We have not tested or certified the demo electronics shown here.",
        ],
      },
    ],
  },
  {
    slug: "family-shopping-guides",
    title: "A calmer way to shop for the whole family.",
    tag: "FAMILY SHOPPING GUIDES",
    intro:
      "A simple shared list can turn scattered purchases into thoughtful decisions that fit your household.",
    image: "tote",
    color: "#EAF7EE",
    category: "essentials",
    readTime: "4 min read",
    sections: [
      {
        title: "Separate a need from a nice-to-have",
        body: "Start with what needs replacing, what you can repair, and what you already own. A short shared list keeps a tempting promotion from becoming an unnecessary purchase. For children’s products, match age guidance and dimensions to the child using them.",
        tips: [
          "Add the purpose, not just the product name, to your list.",
          "Check product safety guidance and official recalls.",
          "Allow time to compare instead of treating every promotion as urgent.",
        ],
      },
      {
        title: "Compare the complete purchase",
        body: "Retailers can differ on shipping, return windows, marketplace sellers, warranties, and subscriptions. Compare the exact model and quantity. A similar-looking bundle may contain fewer accessories or a different size.",
        tips: [
          "Confirm the seller and return address before ordering.",
          "Check unit price only when quantities and materials are comparable.",
          "Review the final checkout total, not just the headline.",
        ],
      },
      {
        title: "Make room for less",
        body: "Before a new item comes home, think about where it will live and how often it will be used. Borrowing or buying secondhand may be appropriate for some items, but safety-critical children’s products need particular care and current guidance.",
        tips: [
          "Measure the intended storage spot.",
          "Set a realistic budget before browsing.",
          "Demo collections on OofCourse are not verified retailer offers.",
        ],
      },
    ],
  },
  {
    slug: "small-space-favorites",
    title: "Small space. More room for real life.",
    tag: "SMALL-SPACE LIVING",
    intro:
      "Choose fewer, better-fitting things by planning around the space you use, not the space in a product photograph.",
    image: "basket",
    color: "#F0EDFF",
    category: "home",
    readTime: "3 min read",
    sections: [
      {
        title: "Measure the whole journey",
        body: "Measure the storage area, doorways, access paths, and clearance around furniture. A compact item can still be awkward if drawers cannot open or cords cross a walkway. Check assembled dimensions, not just packaging size.",
        tips: [
          "Mark dimensions with removable tape before ordering.",
          "Leave clearance for cleaning and everyday movement.",
          "Check manufacturer mounting guidance for shelves and storage.",
        ],
      },
      {
        title: "Make storage easy to maintain",
        body: "Good storage follows your routine. Frequently used things should be easy to reach and put away. Closed baskets can reduce visible clutter, but clear labeling matters when several people share a home.",
        tips: [
          "Group items by task or room.",
          "Keep heavy items low and secure furniture appropriately.",
          "Avoid buying organizers until you know what needs organizing.",
        ],
      },
      {
        title: "Give versatility a practical test",
        body: "A folding or multipurpose product saves space only if switching modes is easy. Ask whether it can be used safely every day, whether parts need separate storage, and whether everyone in your household can operate it.",
        tips: [
          "Look for clear instructions and stable construction.",
          "Consider maintenance as well as footprint.",
          "Our original illustrations show ideas, not real dimensions or tested products.",
        ],
      },
    ],
  },
  {
    slug: "seasonal-shopping-ideas",
    title: "A little planning for the season ahead.",
    tag: "SEASONAL SHOPPING IDEAS",
    intro:
      "Build a seasonal checklist early so useful purchases do not get lost in a rush of promotional messages.",
    image: "backpack",
    color: "#EAF7EE",
    category: "outdoors",
    readTime: "3 min read",
    sections: [
      {
        title: "Begin with what you have",
        body: "Before a new season, check the items already in storage. Inspect condition, fit, and care instructions. Some items may need cleaning, repair, or safe disposal rather than replacement. Follow official guidance for protective or children’s equipment.",
        tips: [
          "Make a repair and replacement list separately.",
          "Check dates and recalls on safety-sensitive items.",
          "Keep a small budget for genuinely unexpected needs.",
        ],
      },
      {
        title: "Shop around the actual occasion",
        body: "Think about weather, travel plans, school requirements, and storage before making a list. An item that works for a weekend trip may not suit everyday commuting. Look for details that matter to your routine rather than seasonal packaging.",
        tips: [
          "Plan around the event date and realistic delivery time.",
          "Check whether returns are possible after the occasion.",
          "Be careful with unnecessary bundles and automatic subscriptions.",
        ],
      },
      {
        title: "Treat urgency as a reason to pause",
        body: "Countdowns and claimed savings do not establish value. Check the retailer’s current terms and compare only reliable, authorized price information. If you cannot verify an offer, it is reasonable to wait.",
        tips: [
          "Do not rely on old screenshots of prices.",
          "Review final shipping and return costs.",
          "No promotion deadlines or live discounts are represented in our demo.",
        ],
      },
    ],
  },
];
