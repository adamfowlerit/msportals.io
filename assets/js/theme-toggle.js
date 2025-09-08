// Theme toggle functionality
(function() {
    'use strict';
    
    const THEME_KEY = 'msportals-theme';
    const LIGHT_CLASS = 'light-theme';
    const DARK_CLASS = 'dark-theme';
    
    // Get elements
    const body = document.body;
    const toggleButton = document.getElementById('theme-toggle');
    
    // Get saved theme or default to 'auto' (follow system preference)
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || 'auto';
    }
    
    // Save theme preference
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    // Apply theme to body
    function applyTheme(theme) {
        // Remove existing theme classes
        body.classList.remove(LIGHT_CLASS, DARK_CLASS);
        
        if (theme === 'light') {
            body.classList.add(LIGHT_CLASS);
            updateToggleButton('☀️', 'Switch to dark mode');
        } else if (theme === 'dark') {
            body.classList.add(DARK_CLASS);
            updateToggleButton('🌙', 'Switch to light mode');
        } else {
            // Auto mode - follow system preference
            updateToggleButton('🌓', 'Toggle light/dark mode');
        }
    }
    
    // Update toggle button appearance
    function updateToggleButton(icon, title) {
        if (toggleButton) {
            toggleButton.textContent = icon;
            toggleButton.title = title;
        }
    }
    
    // Get current theme based on preference and system
    function getCurrentTheme() {
        const saved = getSavedTheme();
        if (saved !== 'auto') {
            return saved;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }
    
    // Cycle through themes: auto -> light -> dark -> auto
    function toggleTheme() {
        const current = getSavedTheme();
        let next;
        
        if (current === 'auto') {
            // If currently auto, switch to light
            next = 'light';
        } else if (current === 'light') {
            // If currently light, switch to dark  
            next = 'dark';
        } else {
            // If currently dark, switch back to auto
            next = 'auto';
        }
        
        saveTheme(next);
        applyTheme(next);
    }
    
    // Initialize theme on page load
    function initializeTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
        
        // Listen for system theme changes when in auto mode
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            mediaQuery.addListener(function() {
                if (getSavedTheme() === 'auto') {
                    applyTheme('auto');
                }
            });
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            
            // Add click listener to toggle button
            if (toggleButton) {
                toggleButton.addEventListener('click', toggleTheme);
            }
        });
    } else {
        initializeTheme();
        
        // Add click listener to toggle button
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    }
})();