import React, { useState } from 'react';

function CommonQuestions() {
  const [openQuestion, setOpenQuestion] = useState(null);
  
  const questions = [
    {
      id: 1,
      title: "How is my value calculated?",
      content: "Our AI analyzes your property using advanced algorithms that process millions of data points including recent comparable sales, neighborhood trends, property features, market conditions, and improvement costs. We combine MLS data, public records, satellite imagery, and local market intelligence to provide accurate valuations and ROI projections for potential improvements."
    },
    {
      id: 2,
      title: "Any catch to getting a ValueBoost report?",
      content: "Nope, absolutely no catch! Your ValueBoost report is completely free with no hidden fees, obligations, or pressure to use our services. We provide genuine value upfront because we believe in the power of our AI recommendations. The only thing we ask for is your contact information so we can deliver your personalized report."
    },
    {
      id: 3,
      title: "How long does the process take?",
      content: "The entire ValueBoost analysis takes just 2-3 minutes. Once you enter your address, our AI immediately begins processing your property data. You'll see your estimated value boost potential within seconds, and receive your complete detailed report with all recommendations within minutes of providing your contact information."
    }
  ];
  
  const toggleQuestion = (questionId) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };
  
  return (
    <section className="bf-section bf-section-alt">
      <div className="bf-container">
        <h2 className="bf-section-title">Common HomeSurge Questions</h2>
        
        <div className="bf-faq-container">
          {questions.map((question) => (
            <div key={question.id} className="bf-faq-item">
              <button 
                className="bf-faq-question"
                onClick={() => toggleQuestion(question.id)}
                aria-expanded={openQuestion === question.id}
              >
                <span>{question.title}</span>
                <div className={`bf-faq-icon ${openQuestion === question.id ? 'bf-faq-icon-open' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                  </svg>
                </div>
              </button>
              <div className={`bf-faq-answer ${openQuestion === question.id ? 'bf-faq-answer-open' : ''}`}>
                <p>{question.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CommonQuestions;