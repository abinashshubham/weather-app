import React, { useState, useEffect } from 'react';
import styles from './AiInsights.module.css';

// Premium real-world apparel context images from Pexels/Unsplash fallbacks
const APPAREL_IMAGES = {
  cold: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=400&q=80",
  warm: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80",
  rainy: "https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?auto=format&fit=crop&w=400&q=80",
  scorching: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80"
};

function AiInsights({ weatherCondition, temp }) {
  const [insight, setInsight] = useState({ clothing: '', activity: '', img: '' });

  useEffect(() => {
    // Advanced Rule-Based AI Engine to process atmospheric inputs
    const generateAiAnalysis = () => {
      if (weatherCondition === 'Rain' || weatherCondition === 'Thunderstorm' || weatherCondition === 'Drizzle') {
        return {
          clothing: "Hydrophobic technical outerwear, waterproof footwear, and a compact windproof umbrella.",
          activity: "Reduced outdoor visibility detected. Prioritize indoor deep-work blocks, streaming, or localized indoor fitness.",
          img: APPAREL_IMAGES.rainy
        };
      } else if (temp < 15) {
        return {
          clothing: "Heavy premium layering, wool-blend long coats, or heavy knitwear sweaters paired with thermals.",
          activity: "Excellent climate for structured indoor brainstorming, visiting museums, or cozy café workspace sessions.",
          img: APPAREL_IMAGES.cold
        };
      } else if (temp >= 15 && temp <= 28) {
        return {
          clothing: "Light tailored jackets, premium denim, breathable cotton shirts, or versatile layering pieces.",
          activity: "Optimal conditions for outdoor meetings, walking transits, and open-air workspace collaborations.",
          img: APPAREL_IMAGES.warm
        };
      } else {
        return {
          clothing: "Lightweight structured linens, UV-blocking sunglasses, and protective headwear.",
          activity: "High thermal indices present. Restrict heavy physical workouts during peak afternoon sun; stay highly hydrated.",
          img: APPAREL_IMAGES.scorching
        };
      }
    };

    setInsight(generateAiAnalysis());
  }, [weatherCondition, temp]); // Monitors climate updates instantly

  return (
    <section className={styles.aiContainer}>
      <div className={styles.textDetails}>
        <div className={styles.headerBlock}>
          <span className={styles.aiSparkle}>✦</span>
          <h3 className={styles.aiTitle}>AI Context Analytics</h3>
        </div>
        <p className={styles.subtext}>Localized lifestyle efficiency recommendations.</p>

        <div className={styles.insightBox}>
          <span className={styles.boxTitle}>Smart Outfit Selection</span>
          <p className={styles.boxContent}>{insight.clothing}</p>
        </div>

        <div className={styles.insightBox}>
          <span className={styles.boxTitle}>Strategic Daily Activity</span>
          <p className={styles.boxContent}>{insight.activity}</p>
        </div>
      </div>

      {/* Realistic Look Apparel Graphic Panel */}
      <div 
        className={styles.apparelImageCard} 
        style={{ backgroundImage: `url(${insight.img})` }}
      >
        <div className={styles.imgGradient}></div>
      </div>
    </section>
  );
}

export default AiInsights;