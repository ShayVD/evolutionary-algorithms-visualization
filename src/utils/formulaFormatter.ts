/**
 * Utility functions for formatting mathematical formulas
 */

/**
 * Format LaTeX mathematical formulas to more readable Unicode text
 * Replaces common LaTeX notation with Unicode equivalents for better display
 * 
 * @param formula - LaTeX formatted formula string
 * @returns Formatted string with Unicode math symbols
 */
export const formatFormula = (formula: string): string => {
  // Replace common LaTeX notation with more readable Unicode equivalents
  return formula
    // Summation symbol
    .replace(/\\sum/g, '∑')
    // Subscript and superscript formatting
    .replace(/_{([^}]+)}/g, '_$1')
    .replace(/\^{([^}]+)}/g, '^$1')
    // Product symbol
    .replace(/\\prod/g, '∏')
    // Exponential
    .replace(/\\exp/g, 'exp')
    // Square root
    .replace(/\\sqrt/g, '√')
    // Greek letters
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\zeta/g, 'ζ')
    .replace(/\\eta/g, 'η')
    .replace(/\\theta/g, 'θ')
    .replace(/\\iota/g, 'ι')
    .replace(/\\kappa/g, 'κ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\xi/g, 'ξ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\upsilon/g, 'υ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    // Absolute value
    .replace(/\\left\|/g, '|')
    .replace(/\\right\|/g, '|')
    // Fraction
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
    // Left and right parentheses
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\\{/g, '{')
    .replace(/\\right\\}/g, '}')
    // Mathematical operations
    .replace(/\\cos/g, 'cos')
    .replace(/\\sin/g, 'sin')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'ln')
    .replace(/\\log/g, 'log')
    // Special constants
    .replace(/\\mathbf{x}/g, 'x')
    .replace(/\\mathbf{([^}]+)}/g, '$1')
    // Mathematical symbols
    .replace(/\\infty/g, '∞')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\in/g, '∈')
    .replace(/\\subset/g, '⊂')
    // Remove extra backslashes
    .replace(/\\\\/g, '')
    // Clean up any remaining LaTeX commands
    .replace(/\\[a-zA-Z]+/g, '');
};

/**
 * Additional helper function to format specific parts of formulas
 * This can be expanded as needed for particular formula patterns
 * 
 * @param text - Text containing partial formula notation
 * @returns Formatted string with applied transformations
 */
export const formatMathText = (text: string): string => {
  return text
    .replace(/_(\d+)/g, '₍$1₎')  // Simple subscripts for numbers
    .replace(/\^(\d+)/g, '⁽$1⁾'); // Simple superscripts for numbers
}; 