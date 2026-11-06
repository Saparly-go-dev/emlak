import type { Client, Property, Match } from "@mekan/contracts";
/** Explainable weighted matching, not a trained machine learning model. */
export function recommend(client: Client, properties: Property[]): Match[] {
  return properties
    .filter(
      (p) =>
        p.status === "available" &&
        p.dealType === client.dealType &&
        p.type === client.type,
    )
    .filter(
      (p) =>
        p.currency === client.currency &&
        (p.dealType !== "rent" || p.rentPeriod === client.rentPeriod),
    )
    .map((p) => {
      const budget =
        p.price <= client.budgetMax
          ? 1
          : Math.max(0, 1 - (p.price - client.budgetMax) / client.budgetMax);
      const district =
        !client.district ||
        p.district.trim().toLowerCase() === client.district.trim().toLowerCase()
          ? 1
          : 0;
      const rooms = !client.rooms
        ? 1
        : Math.max(0, 1 - Math.abs(p.rooms - client.rooms) / client.rooms);
      const area =
        !client.minArea || p.area >= client.minArea
          ? 1
          : p.area / client.minArea;
      const criteria: Match["criteria"] = [
        {
          key: "budget",
          weight: 40,
          value: Math.round(budget * 40),
          matched: p.price <= client.budgetMax,
        },
        {
          key: "district",
          weight: 25,
          value: district * 25,
          matched: district === 1,
        },
        {
          key: "rooms",
          weight: 20,
          value: Math.round(rooms * 20),
          matched: rooms === 1,
        },
        {
          key: "area",
          weight: 15,
          value: Math.round(area * 15),
          matched: area === 1,
        },
      ];
      return {
        property: p,
        score: criteria.reduce((sum, c) => sum + c.value, 0),
        criteria,
      };
    })
    .sort((a, b) => b.score - a.score || a.property.price - b.property.price)
    .slice(0, 10);
}
