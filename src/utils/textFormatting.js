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
    'close on your terms.',
    'close on your terms',
    'No fees, no stress.',
    'No fees, no stress',
    '10 Days or Less.',
    '10 Days or Less',
    'Get a great cash offer today.',
    'Get a great cash offer today',
    'Close in 7 days.',
    'Close in 7 days',
    'No showings, no repairs, no stress.',
    'No showings, no repairs, no stress',
    'For Cash Fast?',
    'For Cash Fast',
    'and home value:',
    'and home value'
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
        // Create a regular expression to match the phrase with any following punctuation
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Enhanced regex to support multiple punctuation characters and a wider variety of symbols
        const phraseWithPunctuationRegex = new RegExp(`${escapedPhrase}([.,:;!?\"'()\\[\\]{}…]*)`, 'g');
        
        // Replace occurrences of the phrase (with punctuation) with a wrapper span
        let processedSegment = segment;
        let match;
        let segmentParts = [];
        let lastIndex = 0;
        
        // Reset the regex before using it for matching
        phraseWithPunctuationRegex.lastIndex = 0;
        
        // Find all matches
        while ((match = phraseWithPunctuationRegex.exec(segment)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            segmentParts.push(segment.substring(lastIndex, match.index));
          }
          
          // Add the wrapped phrase with punctuation
          const fullMatch = match[0]; // The phrase + any punctuation
          segmentParts.push(
            <span key={`${phraseIndex}-${segmentParts.length}`} className="nowrap-phrase">{fullMatch}</span>
          );
          
          // Update lastIndex to continue after this match
          lastIndex = match.index + fullMatch.length;
        }
        
        // Add any remaining text after the last match
        if (lastIndex < segment.length) {
          segmentParts.push(segment.substring(lastIndex));
        }
        
        // Add all parts to the new segments
        newSegments.push(...segmentParts);
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
        <span className="nowrap-phrase">close on your terms.</span>{' '}
        <span className="nowrap-phrase">No fees, no stress.</span>
      </>
    );
  }
  
  // If we have the specific cash template subheadline
  if (text && text === 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress.') {
    return (
      <>
        <span className="nowrap-phrase">Get a great cash offer today.</span>{' '}
        <span className="nowrap-phrase">Close in 7 days.</span>{' '}
        <span className="nowrap-phrase">No showings, no repairs, no stress.</span>
      </>
    );
  }
  
  // Otherwise use the generic formatter
  return formatText(text);
}