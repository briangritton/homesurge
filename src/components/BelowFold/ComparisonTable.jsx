import React from 'react';
import paintswipeImage from '../../assets/images/paintswipe.webp';
import paintswipeImageFallback from '../../assets/images/paintswipe.png';

function ComparisonTable() {
  return (
    <section className="bf-section bf-comparison">
      <div className="bf-container">
        <h2 className="bf-section-title">HomeSurge Cash Offer VS Traditional Sale</h2>
        
        {/* Original 3-column version - commented out */}
        {/*
        <div className="bf-comparison-grid">
          <div className="bf-grid-header">
            <div className="bf-header-benefits">Benefits</div>
            <div className="bf-header-homesurge">HomeSurge</div>
            <div className="bf-header-traditional">Traditional</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">Fees</div>
            <div className="bf-cell-homesurge">$0</div>
            <div className="bf-cell-traditional">6% of home value</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">Home Repairs</div>
            <div className="bf-cell-homesurge">$0</div>
            <div className="bf-cell-traditional">$20,000+</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">Finance costs</div>
            <div className="bf-cell-homesurge">$0</div>
            <div className="bf-cell-traditional">$5,000+</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">Time to closing</div>
            <div className="bf-cell-homesurge">7 days or less!</div>
            <div className="bf-cell-traditional">30-90 days</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">Buyer negotiations</div>
            <div className="bf-cell-homesurge">0</div>
            <div className="bf-cell-traditional">Unknown</div>
          </div>
          
          <div className="bf-grid-row">
            <div className="bf-row-label">AS-IS SALE</div>
            <div className="bf-cell-homesurge">Yes</div>
            <div className="bf-cell-traditional">No</div>
          </div>
        </div>
        */}
        
        {/* New 2-column version */}
        <div className="bf-comparison-two-col">
          <div className="bf-col-header">
            <div className="bf-header-traditional-v2">Traditional Sale</div>
            <div className="bf-header-homesurge-v2">HomeSurge Cash Offer</div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">Fees</div>
              <div className="bf-item-value">6% of home value</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">Fees</div>
              <div className="bf-item-value">$0</div>
            </div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">Home Repairs</div>
              <div className="bf-item-value">$20,000+</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">Home Repairs</div>
              <div className="bf-item-value">$0</div>
            </div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">Finance Costs</div>
              <div className="bf-item-value">$5,000+</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">Finance Costs</div>
              <div className="bf-item-value">$0</div>
            </div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">Time to Closing</div>
              <div className="bf-item-value">30-90 days</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">Time to Closing</div>
              <div className="bf-item-value">7 days or less!</div>
            </div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">Buyer Negotiations</div>
              <div className="bf-item-value">Unknown</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">Buyer Negotiations</div>
              <div className="bf-item-value">0</div>
            </div>
          </div>
          
          <div className="bf-comparison-item">
            <div className="bf-traditional-item">
              <div className="bf-item-label">AS-IS Sale</div>
              <div className="bf-item-value">No</div>
            </div>
            <div className="bf-homesurge-item">
              <div className="bf-item-label">AS-IS Sale</div>
              <div className="bf-item-value">Yes</div>
            </div>
          </div>
        </div>
        
        {/* Paintswipe decoration under right column only */}
        <div className="bf-paintswipe-right-decoration">
          <picture>
            <source srcSet={paintswipeImage} type="image/webp" />
            <img src={paintswipeImageFallback} alt="" className="bf-paintswipe-image" />
          </picture>
        </div>
      </div>
    </section>
  );
}

export default ComparisonTable;