/* ====== Dynamic Search Functionality ====== */

// Global search data structure
let searchIndex = {
  pages: [],
  indexed: false,
};

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
});

function initializeSearch() {
  // Build search index from all content
  buildSearchIndex();

  // Attach event listeners to all search forms
  attachSearchListeners();

  // Add search results container if it doesn't exist
  createSearchResultsContainer();
}

function buildSearchIndex() {
  if (searchIndex.indexed) return;

  // Index the main documentation page content
  const docsSections = document.querySelectorAll(".docs-section, .card");
  const sidebarLinks = document.querySelectorAll(
    "#docs-nav .nav-link, .card-link-mask"
  );

  // Index documentation sections
  docsSections.forEach((section, index) => {
    const heading = section.querySelector("h3, h4, h5, .card-title-text");
    const content = section.textContent || "";

    if (heading && content) {
      searchIndex.pages.push({
        id: `section-${index}`,
        title: heading.textContent.trim(),
        content: content,
        element: section,
        type: "section",
        url: getElementUrl(section),
      });
    }
  });

  // Index navigation items
  sidebarLinks.forEach((link, index) => {
    const linkText = link.textContent || link.getAttribute("title") || "";
    const href = link.getAttribute("href");

    if (linkText && href) {
      searchIndex.pages.push({
        id: `nav-${index}`,
        title: linkText.trim(),
        content: linkText,
        element: link,
        type: "navigation",
        url: href,
      });
    }
  });

  // Index overview cards from index page
  const overviewCards = document.querySelectorAll(".card");
  overviewCards.forEach((card, index) => {
    const title = card.querySelector(".card-title-text");
    const description = card.querySelector(".card-text");
    const link = card.querySelector(".card-link-mask");

    if (title && description) {
      searchIndex.pages.push({
        id: `card-${index}`,
        title: title.textContent.trim(),
        content: title.textContent + " " + description.textContent,
        element: card,
        type: "overview",
        url: link ? link.getAttribute("href") : "#",
      });
    }
  });

  searchIndex.indexed = true;
  console.log("Search index built with", searchIndex.pages.length, "items");
}

function getElementUrl(element) {
  // Try to find associated URL for the element
  const link = element.querySelector("a");
  if (link) return link.getAttribute("href");

  // Check if element has an ID for anchor linking
  if (element.id) return `#${element.id}`;

  // Look for parent with ID
  let parent = element.parentElement;
  while (parent && !parent.id && parent !== document.body) {
    parent = parent.parentElement;
  }

  return parent && parent.id ? `#${parent.id}` : "#";
}

function attachSearchListeners() {
  const searchForms = document.querySelectorAll(".search-form");
  const searchInputs = document.querySelectorAll(".search-input");

  // Handle form submissions
  searchForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const searchInput = this.querySelector(".search-input");
      if (searchInput && searchInput.value.trim()) {
        performDynamicSearch(searchInput.value.trim());
      }
    });
  });

  // Handle real-time search (with debouncing)
  searchInputs.forEach((input) => {
    let searchTimeout;
    input.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length > 2) {
          performDynamicSearch(query);
          showSearchResults(query);
        } else if (query.length === 0) {
          clearSearchResults();
          clearSearchHighlights();
        }
      }, 300);
    });

    // Handle search focus/blur for mobile
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("search-active");
    });

    input.addEventListener("blur", function () {
      // Delay to allow clicking on results
      setTimeout(() => {
        this.parentElement.classList.remove("search-active");
      }, 200);
    });
  });
}

function performDynamicSearch(query) {
  const searchTerm = query.toLowerCase();
  const results = [];

  // Search through indexed content
  searchIndex.pages.forEach((page) => {
    const titleMatch = page.title.toLowerCase().includes(searchTerm);
    const contentMatch = page.content.toLowerCase().includes(searchTerm);

    if (titleMatch || contentMatch) {
      // Calculate relevance score
      let score = 0;
      if (titleMatch) score += 10;
      if (contentMatch) score += 5;
      if (page.title.toLowerCase().startsWith(searchTerm)) score += 15;

      results.push({
        ...page,
        score: score,
        titleMatch: titleMatch,
        contentMatch: contentMatch,
      });
    }
  });

  // Sort results by relevance
  results.sort((a, b) => b.score - a.score);

  // Highlight matching elements on current page
  highlightSearchResults(searchTerm);

  return results;
}

function showSearchResults(query) {
  const results = performDynamicSearch(query);
  const container = document.getElementById("search-results-container");

  if (!container || results.length === 0) {
    if (container) container.style.display = "none";
    return;
  }

  // Build results HTML
  let resultsHTML = `<div class="search-results-header">
        <h6>Search Results for "${query}" (${results.length} found)</h6>
        <button class="btn-close" onclick="clearSearchResults()">&times;</button>
    </div>`;

  resultsHTML += '<div class="search-results-list">';

  results.slice(0, 8).forEach((result) => {
    const icon = getResultIcon(result.type);
    const preview = getContentPreview(result.content, query);
    const safeUrl = result.url.replace(/'/g, "\\'");

    resultsHTML += `
            <a href="${
              result.url
            }" class="search-result-item search-result-link" onclick="navigateToResult('${safeUrl}'); return false;">
                <div class="result-icon">${icon}</div>
                <div class="result-content">
                    <div class="result-title">${highlightText(
                      result.title,
                      query
                    )}</div>
                    <div class="result-preview">${preview}</div>
                    <div class="result-type">${result.type}</div>
                </div>
                <div class="result-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </a>
        `;
  });

  resultsHTML += "</div>";

  container.innerHTML = resultsHTML;
  container.style.display = "block";
  selectedResultIndex = -1; // Reset selection when new results are shown
}

function getResultIcon(type) {
  switch (type) {
    case "section":
      return '<i class="fas fa-file-alt"></i>';
    case "navigation":
      return '<i class="fas fa-link"></i>';
    case "overview":
      return '<i class="fas fa-th-large"></i>';
    default:
      return '<i class="fas fa-search"></i>';
  }
}

function getContentPreview(content, query) {
  const searchTerm = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const index = contentLower.indexOf(searchTerm);

  if (index === -1) return content.substring(0, 100) + "...";

  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + query.length + 40);
  let preview = content.substring(start, end);

  if (start > 0) preview = "..." + preview;
  if (end < content.length) preview = preview + "...";

  return highlightText(preview, query);
}

function highlightText(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function navigateToResult(url) {
  clearSearchResults();

  if (!url || url === "#") {
    return;
  }

  if (url.startsWith("#")) {
    // Same page anchor
    const element = document.querySelector(url);
    if (element) {
      // Add a subtle highlight animation to the target element
      element.style.transition = "background-color 0.3s ease";
      element.style.backgroundColor = "#fff3cd";

      element.scrollIntoView({ behavior: "smooth", block: "start" });

      // Remove highlight after 2 seconds
      setTimeout(() => {
        element.style.backgroundColor = "";
      }, 2000);
    }
  } else if (url.startsWith("http") || url.startsWith("mailto:")) {
    // External link
    window.open(url, "_blank");
  } else {
    // Different page or relative URL
    window.location.href = url;
  }
}

function highlightSearchResults(searchTerm) {
  // Clear previous highlights
  clearSearchHighlights();

  if (!searchTerm) return;

  // Highlight in sidebar navigation
  const sidebarLinks = document.querySelectorAll("#docs-nav .nav-link");
  sidebarLinks.forEach((link) => {
    const text = link.textContent.toLowerCase();
    if (text.includes(searchTerm.toLowerCase())) {
      link.classList.add("search-highlight");
    }
  });

  // Highlight sections and cards
  const sections = document.querySelectorAll(".docs-section, .card");
  sections.forEach((section) => {
    const text = section.textContent.toLowerCase();
    if (text.includes(searchTerm.toLowerCase())) {
      section.classList.add("search-highlight");

      // Show section if it was hidden
      section.style.display = "block";
    } else if (document.querySelectorAll(".search-input[value]").length > 0) {
      // Hide non-matching sections only if search is active
      const activeSearch = Array.from(
        document.querySelectorAll(".search-input")
      ).some((input) => input.value.trim().length > 0);

      if (activeSearch) {
        section.style.display = "none";
      }
    }
  });
}

function clearSearchHighlights() {
  // Remove highlight classes
  document.querySelectorAll(".search-highlight").forEach((element) => {
    element.classList.remove("search-highlight");
  });

  // Show all sections
  document.querySelectorAll(".docs-section, .card").forEach((section) => {
    section.style.display = "block";
  });
}

function clearSearchResults() {
  const container = document.getElementById("search-results-container");
  if (container) {
    container.style.display = "none";
    container.innerHTML = "";
  }

  clearSearchHighlights();
  selectedResultIndex = -1;

  // Clear all search inputs
  document.querySelectorAll(".search-input").forEach((input) => {
    input.value = "";
  });
}

function createSearchResultsContainer() {
  // Check if container already exists
  if (document.getElementById("search-results-container")) return;

  // Create search results container
  const container = document.createElement("div");
  container.id = "search-results-container";
  container.className = "search-results-container";
  container.style.display = "none";

  // Find best place to insert (after search form)
  const searchForm = document.querySelector(".search-form");
  if (searchForm) {
    searchForm.parentNode.insertBefore(container, searchForm.nextSibling);
  } else {
    // Fallback: append to main content
    const mainContent =
      document.querySelector(".page-content") || document.body;
    mainContent.appendChild(container);
  }
}

// Keyboard navigation support
let selectedResultIndex = -1;

document.addEventListener("keydown", function (e) {
  const resultsContainer = document.getElementById("search-results-container");
  const searchResults = document.querySelectorAll(".search-result-item");

  if (e.key === "Escape") {
    clearSearchResults();
    selectedResultIndex = -1;
  }

  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  // Arrow key navigation in search results
  if (
    resultsContainer &&
    resultsContainer.style.display !== "none" &&
    searchResults.length > 0
  ) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedResultIndex = Math.min(
        selectedResultIndex + 1,
        searchResults.length - 1
      );
      updateSelectedResult(searchResults);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
      updateSelectedResult(searchResults);
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      const selectedResult = searchResults[selectedResultIndex];
      if (selectedResult) {
        selectedResult.click();
      }
    }
  }
});

function updateSelectedResult(searchResults) {
  // Remove previous selection
  searchResults.forEach((result) => result.classList.remove("selected"));

  // Add selection to current item
  if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
    const selectedResult = searchResults[selectedResultIndex];
    selectedResult.classList.add("selected");
    selectedResult.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// Export functions for global access
window.performDynamicSearch = performDynamicSearch;
window.clearSearchResults = clearSearchResults;
window.navigateToResult = navigateToResult;
