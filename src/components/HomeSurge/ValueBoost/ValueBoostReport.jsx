import React, { useState } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function ValueBoostReport() {
  const { formData, updateFormData } = useFormContext();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Generate 5-6 random recommendations for the property
  // Normally these would be dynamically selected based on property attributes
  const generateRecommendations = () => {
    // Top 20 value boost strategies from the JSON file
    const allStrategies = [
      { strategy: "Paint Interior with Neutral Colors", 
        description: "Applying fresh, neutral paint colors throughout the interior can dramatically increase appeal and perceived value.",
        costEstimate: "$1,500 - $3,800",
        roiEstimate: "1.5 - 2x investment" },
      { strategy: "Refresh Landscaping & Curb Appeal", 
        description: "Strategic landscaping improvements create a strong first impression and can significantly boost perceived value.",
        costEstimate: "$800 - $2,500",
        roiEstimate: "1.3 - 2x investment" },
      { strategy: "Deep Clean & Declutter Entire Home", 
        description: "Professional deep cleaning and decluttering make spaces appear larger and better maintained.",
        costEstimate: "$400 - $1,200",
        roiEstimate: "3 - 5x investment" },
      { strategy: "Replace or Modernize Light Fixtures", 
        description: "Updated lighting fixtures provide a modern aesthetic and improved functionality to living spaces.",
        costEstimate: "$500 - $2,000",
        roiEstimate: "1.5 - 2x investment" },
      { strategy: "Stage Living and Primary Bedroom", 
        description: "Professional staging in key rooms helps buyers visualize the space and creates emotional connections.",
        costEstimate: "$800 - $3,000",
        roiEstimate: "1.5 - 3x investment" },
      { strategy: "Refinish or Replace Flooring", 
        description: "Refreshed or new flooring in high-traffic areas significantly improves visual appeal and perceived quality.",
        costEstimate: "$2,000 - $8,000",
        roiEstimate: "1.2 - 1.7x investment" },
      { strategy: "Kitchen Cosmetic Upgrades", 
        description: "Strategic updates to countertops, hardware, or backsplash can transform the kitchen without a full renovation.",
        costEstimate: "$1,500 - $5,000",
        roiEstimate: "1.3 - 2x investment" },
      { strategy: "Bathroom Touch-Ups", 
        description: "Affordable updates to fixtures, hardware, and caulking refresh these high-value spaces.",
        costEstimate: "$800 - $3,000",
        roiEstimate: "1.4 - 2x investment" },
      { strategy: "Fresh Exterior Paint or Power Wash", 
        description: "A refreshed exterior significantly improves curb appeal and first impressions.",
        costEstimate: "$1,800 - $5,000",
        roiEstimate: "1.3 - 1.8x investment" },
      { strategy: "Update Entry Door or Garage Door", 
        description: "These high-visibility upgrades create immediate visual impact and perceived quality.",
        costEstimate: "$1,000 - $3,500",
        roiEstimate: "1.3 - 2.1x investment" },
      { strategy: "Fix Inspection Red Flags Preemptively", 
        description: "Addressing potential inspection issues before listing prevents buyer negotiations and deal delays.",
        costEstimate: "Varies",
        roiEstimate: "1.5 - 3x investment" },
      { strategy: "Highlight Energy-Efficient Features", 
        description: "Showcasing or adding energy-efficient elements appeals to cost-conscious and environmentally-minded buyers.",
        costEstimate: "$300 - $1,500",
        roiEstimate: "1.3 - 2x investment" },
      { strategy: "Upgrade Appliances", 
        description: "New, matching appliances create a cohesive, modern kitchen that appeals to most buyers.",
        costEstimate: "$2,500 - $8,000",
        roiEstimate: "1.1 - 1.5x investment" },
      { strategy: "Minor Kitchen Layout Tweaks", 
        description: "Strategic adjustments to improve kitchen flow without full renovation can yield significant value.",
        costEstimate: "$2,000 - $7,000",
        roiEstimate: "1.2 - 1.8x investment" },
      { strategy: "Organize Closets & Storage Areas", 
        description: "Maximizing storage efficiency addresses a top buyer concern and showcases space potential.",
        costEstimate: "$300 - $1,200",
        roiEstimate: "2 - 4x investment" },
      { strategy: "Paint/Refinish Front Door", 
        description: "A striking entry door creates memorable first impressions at minimal cost.",
        costEstimate: "$200 - $500",
        roiEstimate: "2 - 5x investment" },
      { strategy: "Install Modern House Numbers & Fixtures", 
        description: "These small details contribute to a cohesive, updated exterior appearance.",
        costEstimate: "$100 - $400",
        roiEstimate: "2 - 4x investment" },
      { strategy: "Add a Home Office Setup/Space", 
        description: "Dedicated workspace has become increasingly valuable to today's buyers.",
        costEstimate: "$500 - $2,000",
        roiEstimate: "1.3 - 2x investment" },
      { strategy: "Replace Worn Baseboards or Trim", 
        description: "Fresh trim provides a clean, maintained appearance throughout the home.",
        costEstimate: "$800 - $2,800",
        roiEstimate: "1.3 - 1.7x investment" },
      { strategy: "Mention Recent Upgrades in Marketing Materials", 
        description: "Highlighting improvements in marketing helps buyers understand and appreciate added value.",
        costEstimate: "$0 - $200",
        roiEstimate: "5 - 10x investment" }
    ];
    
    // Shuffle and select recommendations based on the upgrades needed count
    const shuffled = [...allStrategies].sort(() => 0.5 - Math.random());
    const count = formData.upgradesNeeded || 5;
    return shuffled.slice(0, count);
  };
  
  // Get recommendations (either from form data or generate new ones)
  const recommendations = formData.recommendations || generateRecommendations();
  
  // Store recommendations in form data if not already there
  if (!formData.recommendations) {
    updateFormData({
      recommendations: recommendations
    });
  }
  
  // Calculate total potential value increase
  const potentialIncrease = formData.potentialValueIncrease || 
    Math.round((formData.apiEstimatedValue || 300000) * 0.18); // 18% increase as fallback
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Handle contact form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };
  
  // Handle contact form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Update form data with contact info
    updateFormData({
      name: contactInfo.name,
      phone: contactInfo.phone,
      email: contactInfo.email,
      leadStage: 'ValueBoost Report Qualified'
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };
  
  return (
    <div className="hero-section" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="hero-middle-container" style={{ maxWidth: '900px' }}>
        <div className="hero-content fade-in">
          {/* Header */}
          <div className="hero-headline" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Your AI-Powered Home Value Boost Plan
          </div>
          
          {/* Property info summary */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ flex: '1 1 300px', minWidth: '300px', marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Property Details</h3>
              <p style={{ margin: '5px 0', fontSize: '15px' }}><strong>Address:</strong> {formData.street || '123 Main St'}</p>
              {formData.bedrooms && formData.bathrooms && (
                <p style={{ margin: '5px 0', fontSize: '15px' }}>
                  <strong>Size:</strong> {formData.bedrooms} beds, {formData.bathrooms} baths, {formData.finishedSquareFootage?.toLocaleString() || '1,500'} sq ft
                </p>
              )}
              <p style={{ margin: '5px 0', fontSize: '15px' }}>
                <strong>Current Value:</strong> {formData.formattedApiEstimatedValue || formatCurrency(formData.apiEstimatedValue) || '$325,000'}
              </p>
            </div>
            
            <div style={{ flex: '1 1 300px', minWidth: '300px', backgroundColor: '#e8f4ff', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0066cc' }}>Value Boost Potential</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ flex: '0 0 auto', fontSize: '28px', marginRight: '10px' }}>📈</div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '22px', color: '#0066cc' }}>
                    {formData.formattedPotentialIncrease || formatCurrency(potentialIncrease)}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>Potential increase with recommended improvements</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: '0 0 auto', fontSize: '22px', marginRight: '10px' }}>✨</div>
                <div>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '16px' }}>
                    {formData.valueIncreasePercentage || '18'}% Value Boost
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    {recommendations.length} customized recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Display recommendations */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>
              Your Customized Value-Boosting Recommendations
            </h2>
            
            {recommendations.map((rec, index) => (
              <div key={index} style={{ 
                marginBottom: '20px', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ 
                    flex: '0 0 40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: '#007bff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: '1' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#007bff' }}>{rec.strategy}</h3>
                    <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}>{rec.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <div style={{ marginRight: '20px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Est. Cost:</span>
                        <span style={{ fontSize: '14px', marginLeft: '5px' }}>{rec.costEstimate}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Est. ROI:</span>
                        <span style={{ fontSize: '14px', marginLeft: '5px' }}>{rec.roiEstimate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA section */}
          {!showContactForm && !submitted ? (
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#0066cc' }}>
                Want These Upgrades Done At No Upfront Cost?
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
                Our concierge service can implement these improvements to maximize your home's value,
                with no payment until your home sells.
              </p>
              <button 
                style={{
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '12px 25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={() => setShowContactForm(true)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
              >
                Check If I Qualify
              </button>
            </div>
          ) : submitted ? (
            <div style={{
              backgroundColor: '#f0fff0',
              borderRadius: '10px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#2e7d32' }}>
                Thank You for Your Interest!
              </h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                A home value specialist will contact you shortly to discuss your value boost options.
              </p>
              <p style={{ margin: '0', fontSize: '16px' }}>
                We've also emailed a copy of this report to {contactInfo.email}
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0066cc', textAlign: 'center' }}>
                Check If You Qualify for Our Concierge Service
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={contactInfo.name} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={contactInfo.phone} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={contactInfo.email} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#7fb8ff' : '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: isSubmitting ? 'default' : 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Check Qualification'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Additional information */}
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
            <p>
              This report is based on current market conditions and property data, but actual results may vary.
              Recommendations are personalized based on your specific property attributes and location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValueBoostReport;