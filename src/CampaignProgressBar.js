import React from 'react';
import './CampaignProgressBar.css';

const CampaignProgressBar = ({ current, target, milestones = [25, 50, 75] }) => {
    const percentage = Math.min(Math.max((current / target) * 100, 0), 100) || 0;

    return (
        <div className="progress-section">
            <div className="progress-stats">
                <div className="stat-item">
                    <span className="stat-value">{current.toLocaleString()} XLM</span>
                    <span className="stat-label">Raised</span>
                </div>
                <div className="stat-item text-right">
                    <span className="stat-value">{target.toLocaleString()} XLM</span>
                    <span className="stat-label">Goal</span>
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-background">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="progress-bar-glow"></div>
                    </div>
                </div>

                {milestones.map((ms) => (
                    <div 
                        key={ms}
                        className={`milestone-marker ${percentage >= ms ? 'reached' : ''}`}
                        style={{ left: `${ms}%` }}
                    >
                        <span className="milestone-label">{ms}%</span>
                    </div>
                ))}
            </div>

            <div className="progress-footer">
                <span className="percentage-text">{percentage.toFixed(1)}% Completed</span>
            </div>
        </div>
    );
};

export default CampaignProgressBar;
