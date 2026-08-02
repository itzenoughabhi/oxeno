import {
  Bell,
  CircleHelp,
  Clock3,
  Gift,
  Heart,
  History,
  LayoutDashboard,
  Medal,
  Percent,
  Star,
  Ticket,
  UserRound,
} from "lucide-react";

export const navigationItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "offers", label: "Offers", icon: Percent },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "loyalty", label: "Loyalty points", icon: Medal },
  { id: "visits", label: "Visit history", icon: History },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "favourites", label: "Favourite stores", icon: Heart },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "support", label: "Support", icon: CircleHelp },
];

const demoOffers = [
  {
    id: "weekend-20",
    title: "A little more for your weekend",
    description: "Enjoy something special on your next visit.",
    discountLabel: "Flat 20% OFF",
    expiresAt: "2026-08-30T23:59:59.000Z",
    couponCode: "WEEKEND20",
    tone: "violet",
  },
  {
    id: "birthday-treat",
    title: "Your birthday treat awaits",
    description: "A handcrafted surprise reserved for your birthday month.",
    discountLabel: "Complimentary dessert",
    expiresAt: "2026-08-31T23:59:59.000Z",
    couponCode: "BIRTHDAY",
    tone: "coral",
  },
  {
    id: "member-monday",
    title: "Members earn more on Monday",
    description: "Double points on every eligible purchase this Monday.",
    discountLabel: "2× loyalty points",
    expiresAt: "2026-09-07T23:59:59.000Z",
    couponCode: "MONDAY2X",
    tone: "blue",
  },
];

const demoVisits = [
  { id: "visit-1", date: "2026-08-01T12:30:00.000Z", amount: "₹1,240", points: 24 },
  { id: "visit-2", date: "2026-07-21T18:05:00.000Z", amount: "₹860", points: 18 },
  { id: "visit-3", date: "2026-07-08T13:20:00.000Z", amount: "₹1,480", points: 30 },
];

const rewards = [
  { id: "coffee", name: "Free coffee", points: 100, icon: "coffee", accent: "blue" },
  { id: "dessert", name: "Free dessert", points: 180, icon: "cake", accent: "coral" },
  { id: "discount10", name: "10% discount", points: 250, icon: "spark", accent: "violet" },
  { id: "discount50", name: "50% discount", points: 500, icon: "star", accent: "gold" },
  { id: "voucher", name: "Gift voucher", points: 800, icon: "gift", accent: "blue" },
];

export function buildCustomerExperience(data, account) {
  const customer = data?.customer || {};
  const business = data?.business || account?.business || {};
  const points = (data?.loyaltyPrograms || []).reduce(
    (total, program) => total + Number(program.pointsBalance || 0),
    0,
  );
  const pointsBalance = points || 220;
  const nextReward = 250;
  const firstName = (customer.name || account?.user?.name || "Abhishek").split(" ")[0];
  const apiOffers = (data?.offers || []).map((offer, index) => ({
    ...offer,
    tone: ["violet", "coral", "blue"][index % 3],
  }));
  const apiVisits = (data?.visits || []).map((visit, index) => ({
    id: `visit-${index}`,
    date: visit.visitedAt,
    amount: "In-store visit",
    points: 0,
    programName: visit.programName,
  }));

  return {
    firstName,
    customer: {
      name: customer.name || account?.user?.name || "Abhishek Sharma",
      email: customer.email || account?.user?.email || "abhishek@example.com",
      mobile: customer.whatsappNumber || "Not added",
      birthDate: customer.birthDate,
      anniversaryDate: customer.anniversaryDate,
      city: customer.city || business.city || "Mumbai",
      isMarried: customer.isMarried,
      memberSince: "August 2025",
    },
    business: {
      name: business.name || "Oxeno Rewards",
      category: business.category || "Neighbourhood rewards",
      city: business.city || customer.city || "Mumbai",
      initials: (business.name || "OR")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    },
    points: pointsBalance,
    nextReward,
    remaining: Math.max(0, nextReward - pointsBalance),
    membership: pointsBalance >= 500 ? "Platinum" : pointsBalance >= 200 ? "Gold" : "Silver",
    offers: apiOffers.length ? apiOffers : demoOffers,
    visits: apiVisits.length ? apiVisits : demoVisits,
    loyaltyHistory: data?.loyaltyHistory || [
      { points: 24, note: "Visit reward", programName: "Oxeno rewards", createdAt: "2026-08-01" },
      { points: 30, note: "Welcome back bonus", programName: "Oxeno rewards", createdAt: "2026-07-08" },
    ],
    rewards,
  };
}

export function formatShortDate(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(
    new Date(value),
  );
}

export function formatLongDate(value) {
  if (!value) return "Not added";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${String(value).slice(0, 10)}T00:00:00`));
}

export const notificationItems = [
  { icon: Gift, title: "Birthday delight", body: "A member-only treat is waiting in your birthday month.", time: "Today", tone: "violet" },
  { icon: Percent, title: "Festival offer", body: "Your curated seasonal offer is ready to explore.", time: "2d ago", tone: "coral" },
  { icon: Clock3, title: "Coupon ending soon", body: "WEEKEND20 expires in 4 days.", time: "2d ago", tone: "blue" },
];
