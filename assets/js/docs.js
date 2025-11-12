"use strict";


/* ====== Define JS Constants ====== */
const sidebarToggler = document.getElementById('docs-sidebar-toggler');
const sidebar = document.getElementById('docs-sidebar');
const sidebarLinks = document.querySelectorAll('#docs-sidebar .scrollto');



/* ===== Responsive Sidebar ====== */

window.onload=function() 
{ 
    responsiveSidebar(); 
};

window.onresize=function() 
{ 
    responsiveSidebar(); 
};


function responsiveSidebar() {
    let w = window.innerWidth;
	if(w >= 1200) {
	    // if larger 
	    console.log('larger');
		sidebar.classList.remove('sidebar-hidden');
		sidebar.classList.add('sidebar-visible');
		
	} else {
	    // if smaller
	    console.log('smaller');
	    sidebar.classList.remove('sidebar-visible');
		sidebar.classList.add('sidebar-hidden');
	}
};

sidebarToggler.addEventListener('click', () => {
	if (sidebar.classList.contains('sidebar-visible')) {
		console.log('visible');
		sidebar.classList.remove('sidebar-visible');
		sidebar.classList.add('sidebar-hidden');
		
	} else {
		console.log('hidden');
		sidebar.classList.remove('sidebar-hidden');
		sidebar.classList.add('sidebar-visible');
	}
});


/* ===== Smooth scrolling ====== */
/*  Note: You need to include smoothscroll.min.js (smooth scroll behavior polyfill) on the page to cover some browsers */
/* Ref: https://github.com/iamdustan/smoothscroll */

sidebarLinks.forEach((sidebarLink) => {
	
	sidebarLink.addEventListener('click', (e) => {
		
		e.preventDefault();
		
		var target = sidebarLink.getAttribute("href").replace('#', '');
		
		//console.log(target);
		
        document.getElementById(target).scrollIntoView({ behavior: 'smooth' });
        
        
        //Collapse sidebar after clicking
		if (sidebar.classList.contains('sidebar-visible') && window.innerWidth < 1200){
			
			sidebar.classList.remove('sidebar-visible');
		    sidebar.classList.add('sidebar-hidden');
		} 
		
    });
	
});


/* ===== Gumshoe SrollSpy ===== */
/* Ref: https://github.com/cferdinandi/gumshoe  */
// Initialize Gumshoe
var spy = new Gumshoe('#docs-nav a', {
	offset: 69, //sticky header height
});


/* ====== SimpleLightbox Plugin ======= */
/*  Ref: https://github.com/andreknieriem/simplelightbox */

var lightbox = new SimpleLightbox('.simplelightbox-gallery a', {/* options */});


/* ====== Document Search Functionality ====== */
document.addEventListener('DOMContentLoaded', function() {
	const searchInputs = document.querySelectorAll('.search-input');
	const searchForms = document.querySelectorAll('.search-form');
	
	// Handle form submission
	searchForms.forEach(form => {
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			const searchInput = this.querySelector('.search-input');
			if (searchInput && searchInput.value.trim()) {
				performSearch(searchInput.value.trim());
			}
		});
	});
	
	// Handle real-time search as user types
	searchInputs.forEach(input => {
		input.addEventListener('input', function() {
			const query = this.value.trim();
			if (query.length > 0) {
				performSearch(query);
			} else {
				clearSearch();
			}
		});
	});
});

function performSearch(query) {
	const searchTermLower = query.toLowerCase();
	const sections = document.querySelectorAll('.docs-section');
	const tableRows = document.querySelectorAll('table tbody tr');
	const sidebarLinks = document.querySelectorAll('#docs-nav .nav-link');
	let matchFound = false;
	let firstMatchElement = null;
	
	// Search through sidebar navigation - highlight ALL that contain the search term
	sidebarLinks.forEach(link => {
		const linkText = link.textContent.toLowerCase().trim();
		
		// Partial match - if link contains search term
		if (linkText.includes(searchTermLower) && searchTermLower.length > 0) {
			link.style.backgroundColor = '#e3f2fd';
			link.style.fontWeight = 'bold';
			link.style.padding = '8px 12px';
			link.style.borderRadius = '4px';
			matchFound = true;
			
			// Store first match for auto-click
			if (!firstMatchElement) {
				firstMatchElement = link;
			}
		} else {
			// Remove highlight from non-matching items
			link.style.backgroundColor = '';
			link.style.fontWeight = '';
			link.style.padding = '';
			link.style.borderRadius = '';
		}
	});
	
	// Search through sections
	sections.forEach(section => {
		const sectionText = section.textContent.toLowerCase();
		
		if (sectionText.includes(searchTermLower)) {
			section.style.display = 'block';
			matchFound = true;
			
			// Highlight matching section headers
			const heading = section.querySelector('h3, h4');
			if (heading && heading.textContent.toLowerCase().includes(searchTermLower)) {
				heading.style.backgroundColor = '#fff3cd';
				heading.style.padding = '10px';
				heading.style.borderRadius = '4px';
			}
		} else {
			section.style.display = 'none';
		}
	});
	
	// Search through table rows (extensions)
	tableRows.forEach(row => {
		const rowTextLower = row.textContent.toLowerCase();
		
		if (rowTextLower.includes(searchTermLower)) {
			row.style.display = 'table-row';
			matchFound = true;
		} else {
			row.style.display = 'none';
		}
	});
	
	// Auto-click and scroll to first matching sidebar item if found
	if (firstMatchElement && firstMatchElement.classList.contains('scrollto')) {
		firstMatchElement.click();
		// Also scroll the sidebar to show the selected item
		firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}
	
	console.log('Search term: ' + query + ' | Matches found: ' + (matchFound ? 'Yes' : 'No'));
}

function clearSearch() {
	const sections = document.querySelectorAll('.docs-section');
	const tableRows = document.querySelectorAll('table tbody tr');
	const sidebarLinks = document.querySelectorAll('#docs-nav .nav-link');
	
	// Clear sidebar highlights
	sidebarLinks.forEach(link => {
		link.style.backgroundColor = '';
		link.style.fontWeight = '';
		link.style.padding = '';
		link.style.borderRadius = '';
	});
	
	// Show all sections
	sections.forEach(section => {
		section.style.display = 'block';
		const heading = section.querySelector('h3, h4');
		if (heading) {
			heading.style.backgroundColor = '';
			heading.style.padding = '';
			heading.style.borderRadius = '';
		}
	});
	
	// Show all table rows
	tableRows.forEach(row => {
		row.style.display = 'table-row';
	});
}











