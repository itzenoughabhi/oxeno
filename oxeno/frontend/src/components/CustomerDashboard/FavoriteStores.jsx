import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import { SectionHeading } from "./Offers.jsx";

export default function FavoriteStores({ business }) {
  const stores = [
    {
      name: business.name,
      place: business.city,
      distance: "0.8 km away",
      accent: "blue",
    },
    {
      name: "Oxeno Social Club",
      place: "Bandra West",
      distance: "2.4 km away",
      accent: "coral",
    },
    {
      name: "Sunday Supply Co.",
      place: "Lower Parel",
      distance: "4.1 km away",
      accent: "violet",
    },
  ];
  return (
    <section className="customer-section" id="favourites">
      <SectionHeading
        eyebrow="Your saved places"
        title="Favourite stores"
        action="Manage favourites"
      />
      <div className="customer-favourites">
        {stores.map((store) => (
          <article className="customer-store-card" key={store.name}>
            <div
              className={`customer-store-card__image customer-store-card__image--${store.accent}`}
            >
              <span>{store.name.slice(0, 1)}</span>
              <button
                type="button"
                aria-label={`Remove ${store.name} from favourites`}
              >
                <Heart size={17} fill="currentColor" />
              </button>
            </div>
            <div>
              <h3>{store.name}</h3>
              <p>
                <MapPin size={14} /> {store.place} · {store.distance}
              </p>
              <button type="button">
                Visit store <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
