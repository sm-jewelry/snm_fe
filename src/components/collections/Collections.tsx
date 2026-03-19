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

    let paused = false;
    let req: number;

    const step = () => {
      if (!paused) {
        slider.scrollLeft += 1;
        // Reset to start when reached halfway (duplicate content)
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      req = requestAnimationFrame(step);
    };

    // Pause on hover (desktop)
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    slider.addEventListener("mouseenter", pause);
    slider.addEventListener("mouseleave", resume);

    // Pause on touch (mobile)
    slider.addEventListener("touchstart", pause, { passive: true });
    slider.addEventListener("touchend", resume);

    req = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(req);
      slider.removeEventListener("mouseenter", pause);
      slider.removeEventListener("mouseleave", resume);
      slider.removeEventListener("touchstart", pause);
      slider.removeEventListener("touchend", resume);
    };
  }, [collections]);

  // Mouse drag scroll for desktop
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = sliderRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const diff = e.pageX - startX.current;
    sliderRef.current.scrollLeft = scrollStart.current - diff;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (id: string, e: React.MouseEvent) => {
    // Prevent navigation if user was dragging
    if (Math.abs(e.pageX - startX.current) > 5) return;
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
      <div
        className="collections-slider"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {[...collections, ...collections].map((item, index) => (
          <div
            key={`${item._id}-${index}`}
            className="collection-card"
            onClick={(e) => handleClick(item._id, e)}
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