import "@/app/city-poster.css";

/** Decorative city artwork, shared by the homepage and account entry. */
export function CityPoster() {
  return (
    <div className="home-city-poster" aria-hidden="true">
      <span className="city-poster-edition">OOFCOURSE / LOCAL LIFE</span>
      <div className="city-poster-type">
        NEW<span>YORK.</span>
      </div>
      <div className="city-poster-sun" />
      <div className="city-poster-skyline">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <span className="city-poster-note">
        A LITTLE CLOSER. A LITTLE MORE LOCAL.
      </span>
      <span className="city-poster-sticker">
        GO
        <br />
        LOCAL ↗
      </span>
    </div>
  );
}
