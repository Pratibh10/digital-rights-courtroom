#!/usr/bin/env python3
"""
Fix missing 'impact' field in cross-exam questions.
Run this AFTER pasting the new cases into data.js:
    python3 fix_impact.py data.js
"""
import re, sys

def fix(filename):
    with open(filename) as f:
        text = f.read()
    
    mapping = {'effective': 'positive', 'risky': 'neutral', 'ineffective': 'negative'}
    fixes = 0
    
    for cat, imp in mapping.items():
        pattern = f"category: '{cat}',"
        pos = 0
        while True:
            idx = text.find(pattern, pos)
            if idx < 0: break
            
            # Find impactExplanation for this question
            ie_idx = text.find("impactExplanation:", idx)
            if ie_idx < 0 or ie_idx - idx > 3000:
                pos = idx + 1
                continue
            
            # Check if impact: already exists between category and impactExplanation
            between = text[idx:ie_idx]
            if re.search(r"\bimpact: '(positive|negative|neutral)'", between):
                pos = idx + 1
                continue
            
            # Find indentation of impactExplanation line
            line_start = text.rfind('\n', 0, ie_idx) + 1
            indent = text[line_start:ie_idx]
            
            # Insert impact field before impactExplanation
            insert = f"impact: '{imp}',\n{indent}"
            text = text[:ie_idx] + insert + text[ie_idx:]
            fixes += 1
            pos = idx + 1
    
    with open(filename, 'w') as f:
        f.write(text)
    
    print(f"Fixed {fixes} missing impact fields in {filename}")

if __name__ == '__main__':
    fix(sys.argv[1] if len(sys.argv) > 1 else 'js/data.js')