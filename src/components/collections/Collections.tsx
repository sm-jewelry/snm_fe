"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/apiClient";

interface Collection {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch collections from API Gateway
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getCollections();
        
        // Handle different response formats
        if (response.success) {
          setCollections(response.data || []);
        } else {
          setCollections(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || collections.length === 0) return;

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

  if (loading) {
    return (
      <section className="collections-section">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading collections...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="collections-section">
        <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="collections-section">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>No collections available at the moment.</p>
        </div>
      </section>
    );
  }

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
    </section>
  );
};

export default Collections;