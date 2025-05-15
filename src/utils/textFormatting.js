/**
 * Utility functions for text formatting
 */

/**
 * Formats a subheadline to protect specific phrases from breaking across lines
 * @param {string} text - The subheadline text to format
 * @returns {JSX.Element|string} - Formatted JSX with protected phrases or the original string
 */
export function formatSubheadline(text) {
  if (!text) return '';
  
  // Check if the text contains any of our protected phrases
  const hasCloseOnYourTerms = text.includes('close on your terms');
  const hasNoFeesNoStress = text.includes('No fees, no stress');
  
  // If neither phrase is present, return the text as is
  if (!hasCloseOnYourTerms && !hasNoFeesNoStress) {
    return text;
  }
  
  // If we have the specific subheadline we know about, return the pre-formatted version
  if (text.includes('Skip the repairs listings') && 
      text.includes('close on your terms') && 
      text.includes('No fees, no stress')) {
    return (
      <>
        Skip the repairs listings. Get a no-obligation cash offer today and{' '}
        <span className="nowrap-phrase">close on your terms</span>.{' '}
        <span className="nowrap-phrase">No fees, no stress.</span>
      </>
    );
  }
  
  // For other text that contains our phrases, replace them with wrapped versions
  let formattedText = text;
  
  // This is a simplified approach - for more complex cases, you would use a regex-based solution
  // or React's dangerouslySetInnerHTML, but for our specific needs this works well
  
  if (hasCloseOnYourTerms || hasNoFeesNoStress) {
    // Split into segments that we can wrap
    const segments = [];
    let currentText = text;
    
    // Process "close on your terms"
    if (hasCloseOnYourTerms) {
      const parts = currentText.split('close on your terms');
      if (parts.length > 1) {
        segments.push(parts[0]);
        segments.push(<span key="close" className="nowrap-phrase">close on your terms</span>);
        currentText = parts.slice(1).join('close on your terms');
      }
    }
    
    // Process "No fees, no stress"
    if (hasNoFeesNoStress && currentText) {
      const parts = currentText.split('No fees, no stress');
      if (parts.length > 1) {
        segments.push(parts[0]);
        segments.push(<span key="fees" className="nowrap-phrase">No fees, no stress</span>);
        if (parts.length > 2) {
          segments.push(parts.slice(1).join('No fees, no stress'));
        }
      } else {
        segments.push(currentText);
      }
    } else if (currentText) {
      segments.push(currentText);
    }
    
    // Return the segments as a React fragment
    return <>{segments}</>;
  }
  
  // Fallback - return the original text
  return text;
}