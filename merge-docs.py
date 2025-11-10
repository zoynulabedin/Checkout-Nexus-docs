#!/usr/bin/env python3
"""
Script to merge comprehensive documentation content into the main docs-page.html file
"""

# Read the comprehensive content
with open('checkout-nexus-docs-content.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Read the main docs page
with open('docs-page.html', 'r', encoding='utf-8') as f:
    main_doc = f.read()

# Find where to insert content (after the navigation, before the footer)
# Look for the line with <div class="docs-content">
content_start = main_doc.find('<div class="docs-content">')
if content_start == -1:
    print("ERROR: Could not find docs-content div")
    exit(1)

# Find the closing of docs-content (before footer)
footer_start = main_doc.find('<footer class="footer">')
if footer_start == -1:
    print("ERROR: Could not find footer")
    exit(1)

# Find where the actual articles start (after <div class="container">)
container_start = main_doc.find('<div class="container">', content_start)
container_end_tag = '</div>\n\t\t</div>\n\t</div><!--//docs-wrapper-->'

# Extract content sections from the comprehensive file (remove HTML comments at top)
content_clean = content.strip()
if content_clean.startswith('<!--'):
    # Skip initial comments
    first_article = content_clean.find('<article')
    if first_article != -1:
        content_clean = content_clean[first_article:]

# Build the new document
new_doc = (
    main_doc[:container_start + len('<div class="container">')]
    + '\n\t\t\t\t'
    + content_clean
    + '\n\n\t\t\t\t'
    + main_doc[footer_start:]
)

# Write the updated file
with open('docs-page-new.html', 'w', encoding='utf-8') as f:
    f.write(new_doc)

print("✓ Successfully created docs-page-new.html with comprehensive documentation!")
print("✓ Review the file and then rename it to docs-page.html")
