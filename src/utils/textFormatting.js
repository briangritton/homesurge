/**
 * Utility functions for text formatting
 */

/**
 * Protects specific phrases from breaking across lines
 * @param {string} text - The text to format (headline or subheadline)
 * @param {Array<string>} phrasesToProtect - Optional list of additional phrases to protect
 * @returns {JSX.Element|string} - Formatted JSX with protected phrases or the original string
 */
export function formatText(text, phrasesToProtect = []) {
  if (!text) return '';
  
  // Special case for the cash template headline
  if (text === 'Need to Sell Your House For Cash Fast?') {
    return (
      <>
        Need to Sell Your House <span className="nowrap-phrase">For Cash Fast?</span>
      </>
    );
  }
  
  // Default phrases to protect
  const defaultProtectedPhrases = [
    'close on your terms',
    'No fees, no stress',
    '10 Days or Less',
    'Get a great cash offer today',
    'Close in 7 days',
    'No agents, no repairs, no stress',
    'For Cash Fast'
  ];
  
  // Combine default phrases with any additional phrases
  const allProtectedPhrases = [...defaultProtectedPhrases, ...phrasesToProtect];
  
  // Check if any phrases need protection
  const phrasesFound = allProtectedPhrases.filter(phrase => 
    text.includes(phrase)
  );
  
  if (phrasesFound.length === 0) {
    return text;
  }
  
  // Process the text to protect the phrases
  let segments = [text];
  
  // For each phrase to protect, split and wrap it
  phrasesFound.forEach((phrase, phraseIndex) => {
    // Process each segment we have so far
    const newSegments = [];
    
    segments.forEach(segment => {
      // Only process string segments
      if (typeof segment !== 'string') {
        newSegments.push(segment);
        return;
      }
      
      if (segment.includes(phrase)) {
        // Split this segment by the phrase
        const parts = segment.split(phrase);
        
        // Add each part with the protected phrase in between
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            // Add the protected phrase
            newSegments.push(
              <span key={`${phraseIndex}-${i}`} className="nowrap-phrase">{phrase}</span>
            );
          }
          
          // Add the part if it's not empty
          if (parts[i]) {
            newSegments.push(parts[i]);
          }
        }
      } else {
        // This segment doesn't contain the phrase, keep it as is
        newSegments.push(segment);
      }
    });
    
    // Update segments for the next phrase
    segments = newSegments;
  });
  
  // Return the segments as a React fragment
  return <>{segments}</>;
}

/**
 * Formats a subheadline to protect specific phrases from breaking across lines
 * @param {string} text - The subheadline text to format
 * @returns {JSX.Element|string} - Formatted JSX with protected phrases or the original string
 */
export function formatSubheadline(text) {
  // If we have the specific fast template subheadline
  if (text && text.includes('Skip the repairs') && 
      text.includes('close on your terms') && 
      text.includes('No fees, no stress')) {
    return (
      <>
        Skip the repairs and listings. Get a no-obligation cash offer today and{' '}
        <span className="nowrap-phrase">close on your terms</span>.{' '}
        <span className="nowrap-phrase">No fees, no stress.</span>
      </>
    );
  }
  
  // If we have the specific cash template subheadline
  if (text && text === 'Get a great cash offer today. Close in 7 days. No agents, no repairs, no stress.') {
    return (
      <>
        <span className="nowrap-phrase">Get a great cash offer today</span>.{' '}
        <span className="nowrap-phrase">Close in 7 days</span>.{' '}
        <span className="nowrap-phrase">No agents, no repairs, no stress</span>.
      </>
    );
  }
  
  // Otherwise use the generic formatter
  return formatText(text);
}