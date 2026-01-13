import React, { useEffect, useRef, useState } from 'react';

interface RobotData {
  id: number;
  name: string;
  status: "active" | "inactive";
  performance: number;
  winRate: number;
  trades: number;
  market: string;
  risk: string;
  color: string;
  icon: string;
}

export const TradingRobots = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  const baseRobots: RobotData[] = [
    {
      id: 1,
      name: "Quantum Forex Master",
      status: "active",
      performance: 32.5,
      winRate: 87,
      trades: 21567,
      market: "Forex OTC",
      risk: "Low",
      color: "#00d4aa",
      icon: "forex"
    },
    {
      id: 2,
      name: "Crypto Storm AI",
      status: "active",
      performance: 45.8,
      winRate: 79,
      trades: 18934,
      market: "Crypto",
      risk: "Medium",
      color: "#ff6b8b",
      icon: "crypto"
    },
    {
      id: 3,
      name: "Forex Sentinel Pro",
      status: "inactive",
      performance: 21.3,
      winRate: 91,
      trades: 24752,
      market: "Forex",
      risk: "Very Low",
      color: "#0095ff",
      icon: "forex"
    },
    {
      id: 4,
      name: "Neural Index Trader",
      status: "active",
      performance: 38.7,
      winRate: 83,
      trades: 17564,
      market: "Indices",
      risk: "Medium",
      color: "#ffa502",
      icon: "indices"
    },
    {
      id: 5,
      name: "Bitcoin Quantum AI",
      status: "active",
      performance: 58.2,
      winRate: 74,
      trades: 20341,
      market: "Crypto",
      risk: "High",
      color: "#ff4757",
      icon: "crypto"
    },
    {
      id: 6,
      name: "Gold Guardian Pro",
      status: "active",
      performance: 19.6,
      winRate: 93,
      trades: 19287,
      market: "Forex OTC",
      risk: "Low",
      color: "#ffd700",
      icon: "forex"
    },
    {
      id: 7,
      name: "AI Forex Scalper",
      status: "active",
      performance: 35.4,
      winRate: 85,
      trades: 22893,
      market: "Forex",
      risk: "Medium",
      color: "#00b4d8",
      icon: "forex"
    }
  ];

  const [displayedRobots, setDisplayedRobots] = useState<RobotData[]>(baseRobots);

  // Générer de nouvelles valeurs aléatoires
  const generateNewValues = (current: RobotData): RobotData => {
    const performanceRange = { min: 15, max: 70 };
    const winRateRange = { min: 70, max: 95 };
    const tradesRange = { min: 15000, max: 28000 };
    
    return {
      ...current,
      performance: parseFloat((Math.random() * (performanceRange.max - performanceRange.min) + performanceRange.min).toFixed(1)),
      winRate: Math.floor(Math.random() * (winRateRange.max - winRateRange.min) + winRateRange.min),
      trades: Math.floor(Math.random() * (tradesRange.max - tradesRange.min) + tradesRange.min)
    };
  };

  // Changer les valeurs toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedRobots(prevRobots => prevRobots.map(robot => generateNewValues(robot)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Dupliquer les robots pour créer un effet infini
  const duplicatedRobots = [...displayedRobots, ...displayedRobots, ...displayedRobots];

  const getSvgIcon = (robot: RobotData) => {
    if (robot.icon === 'forex') {
      return (
        <svg className="robot-icon-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill={robot.color} opacity="0.15"/>
          <circle cx="50" cy="50" r="32" fill={robot.color} opacity="0.25"/>
          <path d="M30,50 L70,50 M50,30 L50,70" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="22" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2"/>
          <circle cx="50" cy="50" r="12" fill={robot.color} opacity="0.8"/>
          <path d="M45,45 L55,55 M55,45 L45,55" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    } else if (robot.icon === 'crypto') {
      return (
        <svg className="robot-icon-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill={robot.color} opacity="0.15"/>
          <polygon points="50,20 65,35 65,65 50,80 35,65 35,35" fill={robot.color} opacity="0.8"/>
          <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="2.5"/>
          <path d="M45,45 L55,55 M55,45 L45,55" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="6" fill="white"/>
        </svg>
      );
    } else if (robot.icon === 'indices') {
      return (
        <svg className="robot-icon-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill={robot.color} opacity="0.15"/>
          <path d="M25,65 L40,50 L55,60 L75,40" fill="none" stroke={robot.color} strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
          <path d="M25,65 L40,50 L55,60 L75,40" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="25" cy="65" r="4" fill="white"/>
          <circle cx="40" cy="50" r="4" fill="white"/>
          <circle cx="55" cy="60" r="4" fill="white"/>
          <circle cx="75" cy="40" r="4" fill="white"/>
        </svg>
      );
    }
    return null;
  };

  // Auto-scroll de droite à gauche
  useEffect(() => {
    if (!containerRef.current || !isScrolling) return;

    const container = containerRef.current;
    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      if (!isScrolling) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      scrollPosition += scrollSpeed;
      container.scrollLeft = scrollPosition;

      // Réinitialiser la position quand on atteint la fin (1/3 car on a dupliqué 3 fois)
      const singleSetWidth = container.scrollWidth / 3;
      if (scrollPosition >= singleSetWidth) {
        scrollPosition = 0;
        container.scrollLeft = 0;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScrolling]);

  // Pause le scroll au survol
  const handleMouseEnter = () => setIsScrolling(false);
  const handleMouseLeave = () => setIsScrolling(true);

  return (
    <>
      <style>{`
        .trading-robots-container {
          background: linear-gradient(135deg, #0a0e1a 0%, #13182b 100%);
          color: #f0f4f8;
          padding: 30px 0;
        }

        .trading-robots-container .container-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .robots-section {
          margin: 30px 0;
        }

        .section-title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 30px;
          color: #ffffff;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
        }

        .section-title::after {
          content: '';
          position: absolute;
          width: 120px;
          height: 3px;
          background: linear-gradient(90deg, #00d4aa, #0095ff);
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .robots-container {
          display: flex;
          overflow-x: auto;
          padding: 20px 10px 30px;
          gap: 25px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .robots-container::-webkit-scrollbar {
          display: none;
        }

        .robot-card {
          flex: 0 0 auto;
          width: 320px;
          background: linear-gradient(145deg, #13182b, #0a0e1a);
          border-radius: 18px;
          padding: 25px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 149, 255, 0.2);
        }

        .robot-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 149, 255, 0.6);
          box-shadow: 0 18px 35px rgba(0, 149, 255, 0.2);
        }

        .robot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .robot-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.3px;
        }

        .robot-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.active {
          background-color: #00d4aa;
          box-shadow: 0 0 10px #00d4aa;
        }

        .status-indicator.inactive {
          background-color: #ff4757;
          box-shadow: 0 0 10px #ff4757;
        }

        .status-text {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .status-text.active {
          color: #00d4aa;
        }

        .status-text.inactive {
          color: #ff4757;
        }

        .robot-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .robot-icon-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 8px rgba(0, 149, 255, 0.5));
        }

        .robot-performance {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #2d3748;
        }

        .performance-item {
          text-align: center;
          flex: 1;
        }

        .performance-value {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 5px;
          line-height: 1;
          transition: color 0.3s ease;
        }

        .performance-value.positive {
          color: #00d4aa;
        }

        .performance-value.negative {
          color: #ff4757;
        }

        .performance-label {
          font-size: 0.8rem;
          color: #a0aec0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .robot-details {
          list-style: none;
          margin-bottom: 25px;
          padding: 0;
        }

        .robot-details li {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #2d3748;
          font-size: 0.9rem;
        }

        .detail-label {
          color: #a0aec0;
          font-weight: 600;
        }

        .detail-value {
          font-weight: 700;
          color: #ffffff;
        }

        .robot-button {
          display: block;
          width: 100%;
          padding: 14px;
          text-align: center;
          background: linear-gradient(90deg, #0095ff, #00d4aa);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .robot-button:hover {
          background: linear-gradient(90deg, #00d4aa, #0095ff);
          transform: scale(1.02);
          box-shadow: 0 8px 16px rgba(0, 149, 255, 0.2);
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .trading-robots-container .container-inner {
            padding: 15px;
          }
          
          .section-title {
            font-size: 1.6rem;
            margin-bottom: 25px;
          }
          
          .robot-card {
            width: 280px;
            padding: 20px;
          }
          
          .robot-name {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.4rem;
          }
          
          .robot-card {
            width: 260px;
          }
        }
      `}</style>
      <section className="trading-robots-container">
        <div className="container-inner">
          {/* Trading Robots Section */}
          <div className="robots-section">
            <h2 className="section-title">Our High-Performance Trading Robots</h2>
            
            <div 
              className="robots-container" 
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {duplicatedRobots.map((robot, index) => (
                <div key={`${robot.id}-${index}`} className="robot-card">
                  <div className="robot-header">
                    <div className="robot-name">{robot.name}</div>
                    <div className="robot-status">
                      <div className={`status-indicator ${robot.status}`}></div>
                      <span className={`status-text ${robot.status}`}>{robot.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="robot-icon">
                    {getSvgIcon(robot)}
                  </div>
                  <div className="robot-performance">
                    <div className="performance-item">
                      <div className={`performance-value ${robot.performance >= 0 ? 'positive' : 'negative'}`}>
                        {robot.performance >= 0 ? '+' : ''}{robot.performance.toFixed(1)}%
                      </div>
                      <div className="performance-label">Performance</div>
                    </div>
                    <div className="performance-item">
                      <div className="performance-value positive">{robot.winRate}%</div>
                      <div className="performance-label">Win Rate</div>
                    </div>
                    <div className="performance-item">
                      <div className="performance-value">{robot.trades.toLocaleString()}</div>
                      <div className="performance-label">Trades</div>
                    </div>
                  </div>
                  <ul className="robot-details">
                    <li>
                      <span className="detail-label">Market</span>
                      <span className="detail-value">{robot.market}</span>
                    </li>
                    <li>
                      <span className="detail-label">Risk Level</span>
                      <span className="detail-value">{robot.risk}</span>
                    </li>
                    <li>
                      <span className="detail-label">Type</span>
                      <span className="detail-value">AI Robot</span>
                    </li>
                  </ul>
                  <a href="#" className="robot-button">
                    {robot.status === 'active' ? 'ACTIVATE ROBOT' : 'VIEW DETAILS'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};