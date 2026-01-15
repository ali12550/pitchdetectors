// DiamondAudioCity Tools JavaScript

// Tool Search Functionality
function searchTools() {
    const searchInput = document.getElementById('toolSearch');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    const toolCards = document.querySelectorAll('.tool-card');

    // Search in sidebar
    sidebarLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (searchTerm === '' || text.includes(searchTerm)) {
            link.parentElement.classList.remove('hidden');
        } else {
            link.parentElement.classList.add('hidden');
        }
    });

    // Search in tool cards
    toolCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        if (searchTerm === '' || title.includes(searchTerm) || desc.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    // Show/hide categories based on visible links
    document.querySelectorAll('.sidebar-category').forEach(category => {
        const visibleLinks = category.querySelectorAll('.sidebar-links li:not(.hidden)');
        if (visibleLinks.length === 0 && searchTerm !== '') {
            category.classList.add('hidden');
        } else {
            category.classList.remove('hidden');
        }
    });
}

// Collapsible Sidebar Categories
function initSidebarCategories() {
    document.querySelectorAll('.sidebar-category h5').forEach(header => {
        header.addEventListener('click', function () {
            const category = this.parentElement;
            const links = category.querySelector('.sidebar-links');
            if (links) {
                links.classList.toggle('collapsed');
                category.classList.toggle('collapsed');
            }
        });
    });
}

// Active Link Highlighting
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            // Expand parent category
            const category = link.closest('.sidebar-category');
            if (category) {
                category.classList.add('active');
            }
        }
    });
}

// Mobile Sidebar Toggle
function initMobileSidebar() {
    const sidebar = document.querySelector('.tools-sidebar');
    if (!sidebar) return;

    // Create toggle button for mobile
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle d-md-none d-sm-none btn btn-primary mb-3';
    toggleBtn.innerHTML = '<i class="bi bi-list"></i> Show Tools Menu';
    toggleBtn.onclick = function () {
        sidebar.classList.toggle('mobile-open');
        this.innerHTML = sidebar.classList.contains('mobile-open')
            ? '<i class="bi bi-x"></i> Hide Tools Menu'
            : '<i class="bi bi-list"></i> Show Tools Menu';
    };

    sidebar.parentElement.insertBefore(toggleBtn, sidebar);
}

// Audio Context Helper
let globalAudioContext = null;
function getAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return globalAudioContext;
}

// Play Tone Helper
function playTone(frequency, duration = 1, type = 'sine') {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Note/Frequency Constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQ = 440;

// Frequency to Note Conversion
function frequencyToNote(freq, a4 = A4_FREQ) {
    const semitones = 12 * Math.log2(freq / a4);
    const noteIndex = Math.round(semitones) + 9;
    const octave = Math.floor((noteIndex + 12) / 12) + 3;
    const note = NOTE_NAMES[(noteIndex % 12 + 12) % 12];
    const exactFreq = a4 * Math.pow(2, Math.round(semitones) / 12);
    const cents = 1200 * Math.log2(freq / exactFreq);

    return { note, octave, cents, exactFreq };
}

// Note to Frequency Conversion
function noteToFrequency(note, octave, a4 = A4_FREQ) {
    const noteIndex = NOTE_NAMES.indexOf(note);
    if (noteIndex === -1) return null;

    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);
    return a4 * Math.pow(2, semitonesFromA4 / 12);
}

// Auto-correlate for Pitch Detection
function autoCorrelate(buffer, sampleRate) {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1;
    const threshold = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buffer[i]) < threshold) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buffer[SIZE - i]) < threshold) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buffer[j] * buffer[j + i];
        }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }

    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

// Format Time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initSidebarCategories();
    highlightActiveLink();
    initMobileSidebar();
});

// Export for use in other scripts
window.DiamondAudio = {
    searchTools,
    playTone,
    frequencyToNote,
    noteToFrequency,
    autoCorrelate,
    formatTime,
    debounce,
    NOTE_NAMES,
    A4_FREQ,
    getAudioContext
};


