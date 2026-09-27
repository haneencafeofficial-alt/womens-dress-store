"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  dresses,
  shippingThresholdCents,
  standardShippingCents,
  type DressProduct,
} from "@/lib/dresses";

type CartItem = { productId: string; size: string; quantity: number };
type CatalogFilter = "All dresses" | "New in" | "Everyday" | "Vacation" | "Occasion";
type IconName =
  | "search"
  | "heart"
  | "bag"
  | "menu"
  | "close"
  | "arrow"
  | "sparkle"
  | "leaf"
  | "truck"
  | "return"
  | "check"
  | "plus"
  | "minus"
  | "trash";

const catalogFilters: CatalogFilter[] = ["All dresses", "New in", "Everyday", "Vacation", "Occasion"];
const cartStorageKey = "muse-dress-cart";
const favoriteStorageKey = "muse-dress-favorites";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const product = dresses.find((dress) => dress.id === item.productId);

  return Boolean(
    product &&
      typeof item.size === "string" &&
      product.sizes.includes(item.size) &&
      typeof item.quantity === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 10,
  );
}

function Icon({ name }: { name: IconName }) {
  let artwork;

  switch (name) {
    case "search":
      artwork = (
        <>
          <circle cx="10.8" cy="10.8" r="6.6" />
          <path d="m16 16 4.3 4.3" />
        </>
      );
      break;
    case "heart":
      artwork = <path d="M20.8 8.8c0 4.6-8.8 10.5-8.8 10.5S3.2 13.4 3.2 8.8a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" />;
      break;
    case "bag":
      artwork = (
        <>
          <path d="M5 8.5h14l1 12H4l1-12Z" />
          <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
        </>
      );
      break;
    case "menu":
      artwork = (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      );
      break;
    case "close":
      artwork = <path d="m6 6 12 12M18 6 6 18" />;
      break;
    case "arrow":
      artwork = <path d="M4 12h15m-6-6 6 6-6 6" />;
      break;
    case "sparkle":
      artwork = (
        <>
          <path d="m12 2.8 1.8 6.4 6.4 1.8-6.4 1.8-1.8 6.4-1.8-6.4-6.4-1.8 6.4-1.8L12 2.8Z" />
          <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
        </>
      );
      break;
    case "leaf":
      artwork = (
        <>
          <path d="M19.5 4.5c-8.8-.4-14.8 2.8-14.8 9.4a5.6 5.6 0 0 0 5.6 5.6c6.6 0 9.8-6 9.4-14.8Z" />
          <path d="M5.5 19.2c2.4-3.9 6-6.7 10.2-8.6" />
        </>
      );
      break;
    case "truck":
      artwork = (
        <>
          <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7" />
          <circle cx="7.5" cy="18" r="1.8" />
          <circle cx="17.5" cy="18" r="1.8" />
        </>
      );
      break;
    case "return":
      artwork = (
        <>
          <path d="M8 8H4V4" />
          <path d="M4.5 8a8 8 0 1 1-.3 7" />
          <path d="M4 8h6" />
        </>
      );
      break;
    case "check":
      artwork = <path d="m5 12 4.4 4.4L19.5 6.5" />;
      break;
    case "plus":
      artwork = <path d="M12 5v14M5 12h14" />;
      break;
    case "minus":
      artwork = <path d="M5 12h14" />;
      break;
    case "trash":
      artwork = (
        <>
          <path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.8 13h9.4l.8-13M9 7V4h6v3" />
        </>
      );
      break;
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.55"
      viewBox="0 0 24 24"
    >
      {artwork}
    </svg>
  );
}

export default function Storefront() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("All dresses");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const savedCart: unknown = JSON.parse(window.localStorage.getItem(cartStorageKey) ?? "[]");
      if (Array.isArray(savedCart)) setCart(savedCart.filter(isCartItem));
    } catch {
      setCart([]);
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
      // The cart remains usable for the current visit if storage is unavailable.
    }
  }, [cart, cartLoaded]);

  useEffect(() => {
    try {
      const savedFavorites: unknown = JSON.parse(
        window.localStorage.getItem(favoriteStorageKey) ?? "[]",
      );
      if (Array.isArray(savedFavorites)) {
        setFavorites(savedFavorites.filter((id): id is string =>
          typeof id === "string" && dresses.some((dress) => dress.id === id),
        ));
      }
    } catch {
      setFavorites([]);
    }
    setFavoritesLoaded(true);
  }, []);

  useEffect(() => {
    if (!favoritesLoaded) return;
    try {
      window.localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
    } catch {
      // Favorites remain available until the page is closed.
    }
  }, [favorites, favoritesLoaded]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!cartOpen && !searchOpen && !mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setCheckoutOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [cartOpen, searchOpen, mobileMenuOpen]);

  const visibleProducts = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return dresses.filter((dress) => {
      const matchesFilter =
        activeFilter === "All dresses" ||
        (activeFilter === "New in" ? dress.isNew : dress.category === activeFilter);
      const matchesSearch =
        !term ||
        `${dress.name} ${dress.subtitle} ${dress.category}`.toLowerCase().includes(term);
      const matchesWishlist = !wishlistOnly || favorites.includes(dress.id);
      return matchesFilter && matchesSearch && matchesWishlist;
    });
  }, [activeFilter, favorites, searchValue, wishlistOnly]);

  const cartLines = cart.flatMap((item) => {
    const product = dresses.find((dress) => dress.id === item.productId);
    return product ? [{ item, product }] : [];
  });
  const subtotalCents = cartLines.reduce(
    (sum, line) => sum + line.product.priceCents * line.item.quantity,
    0,
  );
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= shippingThresholdCents ? 0 : standardShippingCents;
  const totalCents = subtotalCents + shippingCents;
  const bagCount = cart.reduce((count, item) => count + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, shippingThresholdCents - subtotalCents);

  function scrollToCollection(filter?: CatalogFilter) {
    if (filter) setActiveFilter(filter);
    setWishlistOnly(false);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function scrollToStory() {
    setMobileMenuOpen(false);
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleFavorite(productId: string) {
    const isSaved = favorites.includes(productId);
    setFavorites((current) =>
      isSaved ? current.filter((id) => id !== productId) : [...current, productId],
    );
    setToast(isSaved ? "Removed from your saved pieces." : "Saved for a little later.");
  }

  function addToBag(product: DressProduct, size: string) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && item.size === size,
      );
      if (existing) {
        return current.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: Math.min(10, item.quantity + 1) }
            : item,
        );
      }
      return [...current, { productId: product.id, size, quantity: 1 }];
    });
    setOpenProductId(null);
    setToast(`${product.name} · ${size} added to your bag.`);
  }

  function changeQuantity(productId: string, size: string, change: number) {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + change)) }
          : item,
      ),
    );
  }

  function removeFromBag(productId: string, size: string) {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size)),
    );
  }

  function closeCart() {
    setCartOpen(false);
    setCheckoutOpen(false);
    setCheckoutError("");
    setOrderReference(null);
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutBusy(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email: customerEmail,
          shippingAddress,
          items: cart.map(({ productId, size, quantity }) => ({ productId, size, quantity })),
        }),
      });
      const result = (await response.json()) as { error?: string; orderReference?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't place your order. Please try again.");

      setOrderReference(result.orderReference ?? "MUSE");
      setCart([]);
      setCheckoutOpen(false);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "We couldn't place your order. Please try again.",
      );
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterBusy(true);
    setNewsletterError("");
    setNewsletterMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't sign you up just now.");
      setNewsletterMessage("You're on the list. Lovely things are on their way.");
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterError(
        error instanceof Error ? error.message : "We couldn't sign you up just now.",
      );
    } finally {
      setNewsletterBusy(false);
    }
  }

  return (
    <main>
      <div className="announcement-bar">
        <span>A little love note: free US shipping on orders over $150</span>
        <button onClick={() => scrollToCollection("New in")} type="button">
          MEET THE SUMMER EDIT <span aria-hidden="true">→</span>
        </button>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="header-icon mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} />
          </button>

          <a aria-label="Muse home" className="brand-lockup" href="#top">
            <span className="brand-word">muse<span className="brand-period">.</span></span>
            <span className="brand-tagline">DRESSES WITH FEELING</span>
          </a>

          <nav aria-label="Main navigation" className="desktop-nav">
            <button onClick={() => scrollToCollection("New in")} type="button">NEW IN</button>
            <button onClick={() => scrollToCollection("All dresses")} type="button">DRESSES</button>
            <button onClick={() => scrollToCollection("Occasion")} type="button">THE OCCASION EDIT</button>
            <button onClick={scrollToStory} type="button">OUR STORY</button>
          </nav>

          <div className="header-actions">
            <button
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Search dresses"}
              className={`header-icon${searchOpen ? " is-active" : ""}`}
              onClick={() => {
                setSearchOpen((open) => !open);
                setMobileMenuOpen(false);
              }}
              type="button"
            >
              <Icon name="search" />
            </button>
            <button
              aria-label={wishlistOnly ? "Show all dresses" : `Saved styles, ${favorites.length} items`}
              className={`header-icon wishlist-header-icon${wishlistOnly ? " is-active" : ""}`}
              onClick={() => {
                setActiveFilter("All dresses");
                setWishlistOnly((current) => !current);
                setSearchOpen(false);
                window.setTimeout(() => {
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }}
              type="button"
            >
              <Icon name="heart" />
              {favorites.length > 0 && <span className="action-count">{favorites.length}</span>}
            </button>
            <button
              aria-label={`Open shopping bag, ${bagCount} items`}
              className="header-icon bag-header-icon"
              onClick={() => {
                setOrderReference(null);
                setCartOpen(true);
              }}
              type="button"
            >
              <Icon name="bag" />
              {bagCount > 0 && <span className="action-count">{bagCount}</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav aria-label="Mobile navigation" className="mobile-navigation">
            <button onClick={() => scrollToCollection("New in")} type="button">New in <span>01</span></button>
            <button onClick={() => scrollToCollection("All dresses")} type="button">All dresses <span>08</span></button>
            <button onClick={() => scrollToCollection("Vacation")} type="button">The getaway edit <span>↗</span></button>
            <button onClick={() => scrollToCollection("Occasion")} type="button">For the occasion <span>↗</span></button>
            <button onClick={scrollToStory} type="button">Our story <span>↗</span></button>
          </nav>
        )}
      </header>

      {searchOpen && (
        <form
          className="search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            scrollToCollection();
          }}
        >
          <Icon name="search" />
          <label className="sr-only" htmlFor="site-search">Search the collection</label>
          <input
            autoFocus
            id="site-search"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Try ‘floral’, ‘occasion’ or ‘Sunday Bloom’..."
            type="search"
            value={searchValue}
          />
          <button className="search-submit" type="submit">FIND YOUR DRESS</button>
          <button
            aria-label="Close search"
            className="search-close"
            onClick={() => setSearchOpen(false)}
            type="button"
          >
            <Icon name="close" />
          </button>
        </form>
      )}

      <section aria-labelledby="hero-heading" className="hero-section" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span /> THE GOOD-DRESS-ENERGY EDIT</p>
            <h1 id="hero-heading">For every<br />kind of <em>lovely.</em></h1>
            <p className="hero-description">
              The everyday, the almost-special, the dancing-until-late. Feel-good dresses for all the little moments that turn into your favourite ones.
            </p>
            <div className="hero-actions">
              <button className="button-primary" onClick={() => scrollToCollection("All dresses")} type="button">
                Find your dress <Icon name="arrow" />
              </button>
              <button className="text-link" onClick={scrollToStory} type="button">A little about us</button>
            </div>
            <div className="hero-note">
              <span className="hero-note-mark"><Icon name="sparkle" /></span>
              <span><strong>Wear the feeling.</strong><br />Keep the memory.</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              alt="A woman in a romantic floral dress, ready for a sunlit summer day"
              className="hero-image"
              fetchPriority="high"
              src="https://images.pexels.com/photos/4589202/pexels-photo-4589202.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1500"
            />
            <div aria-hidden="true" className="hero-season-stamp">
              <span>YOUR</span><strong>sunny</strong><span>STATE OF MIND</span><i>✳</i>
            </div>
            <div className="hero-image-caption">
              <span>THE SUMMER EDIT</span><span>VOL. 01 — MADE FOR THE MOMENT</span>
            </div>
          </div>
        </div>
        <div className="hero-underbar">
          <span>MADE TO BE WORN, AND WORN AGAIN</span>
          <span className="underbar-center"><Icon name="sparkle" /> A little more feeling, always.</span>
          <span>01 <i>/</i> 04</span>
        </div>
      </section>

      <section aria-label="Our little promises" className="promise-ribbon">
        <div className="promise-item"><Icon name="leaf" /><span>Thoughtful details, always</span></div>
        <span className="promise-divider" aria-hidden="true">✳</span>
        <div className="promise-item"><Icon name="truck" /><span>Free US shipping over $150</span></div>
        <span className="promise-divider" aria-hidden="true">✳</span>
        <div className="promise-item"><Icon name="return" /><span>Easy 30-day returns</span></div>
      </section>

      <section aria-labelledby="collection-heading" className="collection-section" id="shop">
        <div className="collection-heading-row">
          <div>
            <p className="eyebrow">A GOOD PLACE TO START</p>
            <h2 id="collection-heading">
              {wishlistOnly ? <>Your little <em>love list.</em></> : <>Dresses to <em>feel something in.</em></>}
            </h2>
            <p className="section-intro">
              A very good dress can change the whole feeling of a day. Here are a few to begin with.
            </p>
          </div>
          <button className="view-all-link" onClick={() => { setActiveFilter("All dresses"); setWishlistOnly(false); setSearchValue(""); }} type="button">
            VIEW ALL EIGHT <Icon name="arrow" />
          </button>
        </div>

        <div aria-label="Filter dresses by style" className="collection-toolbar">
          <div className="filter-list" role="group">
            {catalogFilters.map((filter) => (
              <button
                aria-pressed={!wishlistOnly && activeFilter === filter}
                className={`filter-pill${!wishlistOnly && activeFilter === filter ? " is-selected" : ""}`}
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setWishlistOnly(false);
                }}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="product-count">{visibleProducts.length.toString().padStart(2, "0")} LOVELY THINGS</p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product, index) => {
              const isFavorite = favorites.includes(product.id);
              const choosingSize = openProductId === product.id;
              return (
                <article className="product-card" key={product.id} style={{ "--card-index": index } as React.CSSProperties}>
                  <div className="product-image-wrap">
                    <img
                      alt={product.imageAlt}
                      className="product-image"
                      loading="lazy"
                      src={product.image}
                    />
                    {product.badge && <span className={`product-badge${product.isNew ? " badge-blush" : ""}`}>{product.badge}</span>}
                    <button
                      aria-label={isFavorite ? `Remove ${product.name} from saved styles` : `Save ${product.name}`}
                      aria-pressed={isFavorite}
                      className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
                      onClick={() => toggleFavorite(product.id)}
                      type="button"
                    >
                      <Icon name="heart" />
                    </button>
                    {choosingSize ? (
                      <div className="size-picker">
                        <div className="size-picker-heading"><span>MAKE IT YOURS</span><button aria-label="Close size selector" onClick={() => setOpenProductId(null)} type="button"><Icon name="close" /></button></div>
                        <div className="size-options">
                          {product.sizes.map((size) => (
                            <button
                              aria-label={`Add ${product.name} in size ${size}`}
                              key={size}
                              onClick={() => addToBag(product, size)}
                              type="button"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button className="quick-add-button" onClick={() => setOpenProductId(product.id)} type="button">
                        <span>QUICK ADD</span><span className="quick-add-plus">+</span>
                      </button>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>
                      <span className="product-price">{formatPrice(product.priceCents)}</span>
                    </div>
                    <p className="product-subtitle">{product.subtitle}</p>
                    <div className="product-swatches" aria-label={`Available colours for ${product.name}`}>
                      {product.colors.map((color) => (
                        <span
                          aria-label={color.name}
                          className="color-swatch"
                          key={`${product.id}-${color.hex}`}
                          style={{ "--swatch-color": color.hex } as React.CSSProperties}
                          title={color.name}
                        />
                      ))}
                      <span className="color-count">{product.colors.length} colours</span>
                      <span className="product-category">{product.category}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-collection">
            <span className="empty-heart"><Icon name="heart" /></span>
            <h3>{wishlistOnly && favorites.length === 0 ? "Your love list is waiting." : "No dresses found just yet."}</h3>
            <p>{wishlistOnly && favorites.length === 0 ? "Tap the little heart on anything that feels like you." : "Try another search or give a different edit a peek."}</p>
            <button className="button-primary" onClick={() => { setWishlistOnly(false); setActiveFilter("All dresses"); setSearchValue(""); }} type="button">
              Browse all dresses <Icon name="arrow" />
            </button>
          </div>
        )}

        <div className="collection-footer-note"><span>✳</span> Little reminder: the best dress is the one that feels like you.</div>
      </section>

      <section aria-labelledby="story-heading" className="story-section" id="story">
        <div className="story-image-wrap">
          <img
            alt="A woman in a floral dress among summer blooms"
            loading="lazy"
            src="https://images.pexels.com/photos/8890956/pexels-photo-8890956.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200"
          />
          <div className="story-image-note"><Icon name="sparkle" /><span>A FEELING, NOT A DRESS CODE</span></div>
        </div>
        <div className="story-copy">
          <p className="eyebrow"><span className="story-eyebrow-dot" /> THE MUSE WAY</p>
          <h2 id="story-heading">Made for the<br />moment. <em>And you.</em></h2>
          <p>
            We believe a dress should feel like an invitation: to take the long way home, stay for one more song, or make an ordinary Tuesday feel like something.
          </p>
          <p>
            So we make the kind you reach for without thinking—and remember long after the day is done.
          </p>
          <button className="story-link" onClick={() => scrollToCollection("All dresses")} type="button">
            FIND YOUR FEELING <Icon name="arrow" />
          </button>
          <div className="story-signoff"><span>With love,</span><strong>the muse girls <i>✳</i></strong></div>
        </div>
      </section>

      <section aria-label="The Muse difference" className="little-things-section">
        <div className="little-things-heading">
          <p className="eyebrow">THE LITTLE THINGS</p>
          <h2>Lovely from the <em>first hello.</em></h2>
        </div>
        <div className="little-things-grid">
          <article className="little-thing">
            <span className="little-thing-icon"><Icon name="leaf" /></span>
            <h3>Thought through.</h3>
            <p>Soft-to-the-touch fabrics, considered cuts, and those tiny details you notice later.</p>
          </article>
          <article className="little-thing">
            <span className="little-thing-icon"><Icon name="sparkle" /></span>
            <h3>Made for real life.</h3>
            <p>Pretty enough for the plans. Comfortable enough to forget you’re wearing it.</p>
          </article>
          <article className="little-thing">
            <span className="little-thing-icon"><Icon name="return" /></span>
            <h3>Easy does it.</h3>
            <p>Free US shipping over $150, and a little extra time to make sure it feels right.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="newsletter-heading" className="newsletter-section">
        <div aria-hidden="true" className="newsletter-flower newsletter-flower-left">✳</div>
        <div className="newsletter-inner">
          <p className="eyebrow">LETTERS FROM MUSE</p>
          <h2 id="newsletter-heading">A little lovely, <em>in your inbox.</em></h2>
          <p>New dresses, happy notes, and the occasional reason to get dressed up. Never too much, always with love.</p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <input
              autoComplete="email"
              id="newsletter-email"
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="Your email address"
              required
              type="email"
              value={newsletterEmail}
            />
            <button disabled={newsletterBusy} type="submit">
              {newsletterBusy ? "ONE MOMENT..." : "COUNT ME IN"} <Icon name="arrow" />
            </button>
          </form>
          {newsletterMessage && <p aria-live="polite" className="form-message success-message"><Icon name="check" />{newsletterMessage}</p>}
          {newsletterError && <p aria-live="polite" className="form-message error-message">{newsletterError}</p>}
          <span className="newsletter-fine-print">Only the good stuff. Unsubscribe whenever.</span>
        </div>
        <div aria-hidden="true" className="newsletter-flower newsletter-flower-right">✳</div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand-lockup footer-brand-lockup" href="#top">
              <span className="brand-word">muse<span className="brand-period">.</span></span>
              <span className="brand-tagline">DRESSES WITH FEELING</span>
            </a>
            <p>For every version of you.<br />And all the moments in between.</p>
          </div>
          <div className="footer-column">
            <h3>THE GOOD STUFF</h3>
            <button onClick={() => scrollToCollection("New in")} type="button">New in</button>
            <button onClick={() => scrollToCollection("All dresses")} type="button">All dresses</button>
            <button onClick={() => scrollToCollection("Occasion")} type="button">Occasion dressing</button>
          </div>
          <div className="footer-column">
            <h3>HERE FOR YOU</h3>
            <a href="mailto:hello@muse.example">Get in touch</a>
            <button onClick={scrollToStory} type="button">Our little story</button>
            <span>Easy 30-day returns</span>
          </div>
          <div className="footer-note">
            <span>✳</span>
            <p>Get dressed for the<br /><em>feeling.</em></p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MUSE. MADE WITH A LITTLE LOVE.</span>
          <span>THE PREVIEW CHECKOUT SAVES ORDERS; NO PAYMENT IS COLLECTED.</span>
          <a href="#top">BACK TO THE TOP ↑</a>
        </div>
      </footer>

      {cartOpen && (
        <div className="cart-overlay">
          <button aria-label="Close shopping bag" className="drawer-scrim" onClick={closeCart} type="button" />
          <aside aria-labelledby="cart-heading" aria-modal="true" className="cart-drawer" role="dialog">
            <div className="drawer-heading">
              <div>
                <p className="eyebrow">A VERY GOOD CHOICE</p>
                <h2 id="cart-heading">{orderReference ? "It's official." : checkoutOpen ? "Almost yours." : "Your little bag."}</h2>
              </div>
              <button aria-label="Close shopping bag" className="drawer-close" onClick={closeCart} type="button"><Icon name="close" /></button>
            </div>

            {orderReference ? (
              <div className="order-confirmation">
                <span className="confirmation-mark"><Icon name="check" /></span>
                <p className="eyebrow">ORDER PLACED WITH LOVE</p>
                <h3>Something lovely<br />is on its way.</h3>
                <p>Your order has been saved. Keep this reference close:</p>
                <strong className="order-reference">MUSE-{orderReference}</strong>
                <p className="confirmation-demo-note">This preview doesn’t collect payment. Your order is recorded for the shop team.</p>
                <button className="button-primary" onClick={closeCart} type="button">Keep looking <Icon name="arrow" /></button>
              </div>
            ) : checkoutOpen ? (
              <form className="checkout-form" onSubmit={placeOrder}>
                <button className="back-to-bag" onClick={() => { setCheckoutOpen(false); setCheckoutError(""); }} type="button">
                  <span aria-hidden="true">←</span> Back to your bag
                </button>
                <p className="checkout-intro">Where should your lovely parcel find you?</p>
                <label>
                  YOUR NAME
                  <input autoComplete="name" maxLength={120} onChange={(event) => setCustomerName(event.target.value)} required value={customerName} />
                </label>
                <label>
                  EMAIL ADDRESS
                  <input autoComplete="email" onChange={(event) => setCustomerEmail(event.target.value)} required type="email" value={customerEmail} />
                </label>
                <label>
                  SHIPPING ADDRESS
                  <textarea autoComplete="street-address" maxLength={500} onChange={(event) => setShippingAddress(event.target.value)} required rows={3} value={shippingAddress} />
                </label>
                {checkoutError && <p aria-live="polite" className="checkout-error">{checkoutError}</p>}
                <div className="checkout-mini-total"><span>ORDER TOTAL</span><strong>{formatPrice(totalCents)}</strong></div>
                <p className="demo-checkout-note">Demo checkout · no payment will be collected.</p>
                <button className="button-primary checkout-submit" disabled={checkoutBusy || cartLines.length === 0} type="submit">
                  {checkoutBusy ? "SAVING YOUR ORDER..." : "PLACE MY ORDER"}<Icon name={checkoutBusy ? "sparkle" : "arrow"} />
                </button>
              </form>
            ) : cartLines.length === 0 ? (
              <div className="empty-bag">
                <span className="empty-bag-icon"><Icon name="bag" /></span>
                <h3>It’s a little empty in here.</h3>
                <p>Your next favourite dress is just around the corner.</p>
                <button className="button-primary" onClick={closeCart} type="button">Meet the dresses <Icon name="arrow" /></button>
              </div>
            ) : (
              <>
                <div className="shipping-progress-wrap">
                  {amountUntilFreeShipping > 0 ? (
                    <p>You’re <strong>{formatPrice(amountUntilFreeShipping)}</strong> away from complimentary shipping.</p>
                  ) : (
                    <p><strong>A little treat:</strong> your shipping is on us.</p>
                  )}
                  <div aria-label={amountUntilFreeShipping > 0 ? `${Math.round((subtotalCents / shippingThresholdCents) * 100)} percent to free shipping` : "Free shipping unlocked"} className="shipping-progress-track">
                    <span style={{ width: `${Math.min(100, (subtotalCents / shippingThresholdCents) * 100)}%` }} />
                  </div>
                </div>
                <div className="cart-line-items">
                  {cartLines.map(({ item, product }) => (
                    <article className="cart-line" key={`${item.productId}-${item.size}`}>
                      <img alt={product.imageAlt} loading="lazy" src={product.image} />
                      <div className="cart-line-details">
                        <div className="cart-line-top"><h3>{product.name}</h3><strong>{formatPrice(product.priceCents * item.quantity)}</strong></div>
                        <p>Size {item.size} <span>·</span> {product.category}</p>
                        <div className="cart-line-bottom">
                          <div aria-label={`Quantity ${item.quantity}`} className="quantity-control">
                            <button aria-label={`Decrease ${product.name} quantity`} disabled={item.quantity <= 1} onClick={() => changeQuantity(item.productId, item.size, -1)} type="button"><Icon name="minus" /></button>
                            <span>{item.quantity}</span>
                            <button aria-label={`Increase ${product.name} quantity`} disabled={item.quantity >= 10} onClick={() => changeQuantity(item.productId, item.size, 1)} type="button"><Icon name="plus" /></button>
                          </div>
                          <button aria-label={`Remove ${product.name} from bag`} className="remove-item" onClick={() => removeFromBag(item.productId, item.size)} type="button"><Icon name="trash" /> REMOVE</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-summary-row"><span>Subtotal</span><strong>{formatPrice(subtotalCents)}</strong></div>
                  <div className="cart-summary-row"><span>Shipping</span><strong>{shippingCents === 0 ? "On us" : formatPrice(shippingCents)}</strong></div>
                  <div className="cart-summary-row cart-total-row"><span>Total</span><strong>{formatPrice(totalCents)}</strong></div>
                  <button className="button-primary checkout-button" onClick={() => { setCheckoutError(""); setCheckoutOpen(true); }} type="button">
                    Continue to checkout <Icon name="arrow" />
                  </button>
                  <p className="cart-demo-note">A preview order is saved for the shop team. No payment is collected.</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {toast && <div aria-live="polite" className="toast-message"><Icon name="check" />{toast}</div>}
    </main>
  );
}
