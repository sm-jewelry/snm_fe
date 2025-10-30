import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  parents?: string[];
  level?: string;
}

// ✅ Use env variable instead of hardcoded URL
const CATEGORY_API_BASE = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;
const CATEGORY_API = `${CATEGORY_API_BASE}/api/categories/level`;

const NavHeader: React.FC = () => {
  const [c1, setC1] = useState<Category[]>([]);
  const [c2, setC2] = useState<Category[]>([]);
  const [c3, setC3] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Fetch all 3 category levels in parallel
    Promise.all([
      fetch(`${CATEGORY_API}/C1`).then((res) => res.json()),
      fetch(`${CATEGORY_API}/C2`).then((res) => res.json()),
      fetch(`${CATEGORY_API}/C3`).then((res) => res.json()),
    ])
      .then(([c1Data, c2Data, c3Data]) => {
        setC1(c1Data);
        setC2(c2Data);
        setC3(c3Data);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const getChildren = (parentId: string, categories: Category[]) =>
    categories.filter((cat) => cat.parents?.includes(parentId));

  return (
    <>
      {/* Desktop / Tablet Nav */}
      <nav className="nav-header">
        {/* Desktop horizontal menu */}
        {c1.length > 0 && (
          <>
            <Link href="/">Home</Link>

            <div className="dropdown">
              <span className="nav-link">Shop</span>
              <div className="dropdown-content">
                {c1.map((parent) => (
                  <div key={parent._id} className="dropdown nested">
                    <span className="nav-link">{parent.name}</span>
                    <div className="dropdown-content nested-content">
                      {getChildren(parent._id, c2).map((child) => (
                        <div key={child._id} className="dropdown nested">
                          <span className="nav-link">{child.name}</span>
                          <div className="dropdown-content nested-content">
                            {getChildren(child._id, c3).map((subChild) => (
                              <Link
                                key={subChild._id}
                                href={`/category/${subChild._id}`}
                              >
                                {subChild.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dropdown">
              <span className="nav-link">Products</span>
              <div className="dropdown-content">
                <Link href="/products/new-arrivals">New Arrivals</Link>
                <Link href="/products/best-sellers">Best Sellers</Link>
              </div>
            </div>

            <div className="dropdown">
              <span className="nav-link">Pages</span>
              <div className="dropdown-content">
                <Link href="/legal/about-us">About</Link>
                <Link href="/legal/contact-us">Contact</Link>
              </div>
            </div>

            <Link href="/shop">Buy now</Link>
          </>
        )}

        {/* Mobile Menu Button */}
        {isClient && window.innerWidth < 768 && (
          <button
            className="nav-link"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            ☰ Menu
          </button>
        )}
      </nav>

      {/* Mobile Menu */}
      {isClient && window.innerWidth < 768 && mobileMenuOpen && (
        <div className="mobile-menu show">
          <Link href="/">Home</Link>

          <div className="dropdown">
            <span className="nav-link">Shop</span>
            <div className="dropdown-content mobile-dropdown">
              {c1.map((parent) => (
                <div key={parent._id} className="dropdown nested">
                  <span className="nav-link">{parent.name}</span>
                  <div className="dropdown-content nested-content mobile-dropdown">
                    {getChildren(parent._id, c2).map((child) => (
                      <div key={child._id} className="dropdown nested">
                        <span className="nav-link">{child.name}</span>
                        <div className="dropdown-content nested-content mobile-dropdown">
                          {getChildren(child._id, c3).map((subChild) => (
                            <Link
                              key={subChild._id}
                              href={`/category/${subChild._id}`}
                            >
                              {subChild.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dropdown">
            <span className="nav-link">Products</span>
            <div className="dropdown-content mobile-dropdown">
              <Link href="/products/new-arrivals">New Arrivals</Link>
              <Link href="/products/best-sellers">Best Sellers</Link>
            </div>
          </div>

          <div className="dropdown">
            <span className="nav-link">Pages</span>
            <div className="dropdown-content mobile-dropdown">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <Link href="/blog">Blog</Link>
          <Link href="/shop">Buy now</Link>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {isClient && window.innerWidth < 768 && (
        <div className="mobile-bottom-nav">
          <button onClick={() => setMobileMenuOpen((prev) => !prev)}>
            ☰<br />
            Menu
          </button>
          <button>
            🔍<br />
            Search
          </button>
          <button>
            ❤️<br />
            Wishlist
          </button>
          <button>
            🛒<br />
            Cart
          </button>
          <Link href="/login">
            👤<br />
            Account
          </Link>
        </div>
      )}
    </>
  );
};

export default NavHeader;
