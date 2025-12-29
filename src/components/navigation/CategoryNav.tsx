import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  level: string;
  children?: Category[];
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/category-products/hierarchy`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <nav className="category-nav">
      <ul className="category-nav-list">
        <li className="category-nav-item">
          <span className="category-nav-link shop-label">Shop</span>
          <div className="mega-menu">
            <div className="mega-menu-content">
              {categories.map((c1) => (
                <div key={c1._id} className="mega-menu-column">
                  <Link
                    href={`/shop/category/${c1._id}`}
                    className="mega-menu-header"
                    onMouseEnter={() => setActiveMenu(c1._id)}
                  >
                    {c1.name}
                  </Link>

                  {c1.children && c1.children.length > 0 && (
                    <ul className="mega-menu-list">
                      {c1.children.map((c2) => (
                        <li key={c2._id} className="mega-menu-item">
                          <Link
                            href={`/shop/category/${c2._id}`}
                            className="mega-menu-subheader"
                            onMouseEnter={() => setActiveSubmenu(c2._id)}
                          >
                            {c2.name}
                          </Link>

                          {c2.children && c2.children.length > 0 && (
                            <ul className="mega-menu-sublist">
                              {c2.children.map((c3) => (
                                <li key={c3._id}>
                                  <Link href={`/shop/category/${c3._id}`} className="mega-menu-link">
                                    {c3.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default CategoryNav;
