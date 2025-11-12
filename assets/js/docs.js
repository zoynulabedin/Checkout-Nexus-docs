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
			if (this.value.trim().length > 0) {
				performSearch(this.value.trim());
			} else {
				clearSearch();
			}
		});
	});
});

function performSearch(query) {
	const searchTerm = query.toLowerCase();
	const sections = document.querySelectorAll('.docs-section');
	const articles = document.querySelectorAll('.docs-article');
	let matchFound = false;
	
	// Search through sections
	sections.forEach(section => {
		const text = section.textContent.toLowerCase();
		const heading = section.querySelector('.section-heading');
		
		if (text.includes(searchTerm)) {
			section.style.display = 'block';
			// Highlight the heading if it contains the search term
			if (heading && heading.textContent.toLowerCase().includes(searchTerm)) {
				heading.style.backgroundColor = '#fff3cd';
				heading.style.padding = '10px';
				heading.style.borderRadius = '4px';
			}
			matchFound = true;
		} else {
			section.style.display = 'none';
		}
	});
	
	// Search through articles
	articles.forEach(article => {
		const sections = article.querySelectorAll('.docs-section');
		let articleHasMatch = false;
		
		sections.forEach(section => {
			if (section.style.display !== 'none') {
				articleHasMatch = true;
			}
		});
		
		if (!articleHasMatch) {
			article.style.display = 'none';
		} else {
			article.style.display = 'block';
		}
	});
	
	// If no matches found, show a message
	if (!matchFound) {
		console.log('No results found for: ' + query);
	}
}

function clearSearch() {
	const sections = document.querySelectorAll('.docs-section');
	const articles = document.querySelectorAll('.docs-article');
	
	// Show all sections
	sections.forEach(section => {
		section.style.display = 'block';
		const heading = section.querySelector('.section-heading');
		if (heading) {
			heading.style.backgroundColor = '';
			heading.style.padding = '';
			heading.style.borderRadius = '';
		}
	});
	
	// Show all articles
	articles.forEach(article => {
		article.style.display = 'block';
	});
}











