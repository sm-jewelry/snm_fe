"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Collection {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch collections from API
    const fetchCollections = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL}/api/collections`);
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Duplicate the content so we can scroll seamlessly
    // slider.innerHTML += slider.innerHTML;

    let scrollAmount = 0;
    const speed = 1; // pixels per frame
    let req: number;

    const step = () => {
      scrollAmount += speed;
      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0;
      }
      slider.scrollLeft = scrollAmount;
      req = requestAnimationFrame(step);
    };

    req = requestAnimationFrame(step);
    return () => cancelAnimationFrame(req);
  }, [collections]);

  const handleClick = (id: string) => {
    router.push(`/collections/${id}`);
  };

  return (
    <section className="collections-section">
      <div className="collections-slider" ref={sliderRef}>
  {[...collections, ...collections].map((item, index) => (
    <div
      key={`${item._id}-${index}`}
      className="collection-card"
      onClick={() => handleClick(item._id)}
      style={{ cursor: "pointer" }}
    >
      <img src={item.imageUrl} alt={item.name} />
      <div className="collection-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    </div>
  ))}
</div>


      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Welcome to NQD Fashion Store</h1>
        <p>Explore our categories above.</p>
      </div>
    </section>
  );
};

export default Collections;
