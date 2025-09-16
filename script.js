// Global variables
let currentAnalysis = {
    crop: null,
    pest: null,
    soil: null
};

// DOM Elements
const elements = {
    // Crop Health
    cropUpload: document.getElementById('crop-upload'),
    cropFile: document.getElementById('crop-file'),
    cropResult: document.getElementById('crop-result'),
    cropLoading: document.getElementById('crop-loading'),
    cropStatus: document.getElementById('crop-status'),
    cropClass: document.getElementById('crop-class'),
    cropConfidence: document.getElementById('crop-confidence'),
    cropDetails: document.getElementById('crop-details'),
    
    // Pest Detection
    pestUpload: document.getElementById('pest-upload'),
    pestFile: document.getElementById('pest-file'),
    pestResults: document.getElementById('pest-results'),
    pestLoading: document.getElementById('pest-loading'),
    pestCount: document.getElementById('pest-count'),
    
    // Soil Condition
    moistureSlider: document.getElementById('moisture'),
    nitrogenSlider: document.getElementById('nitrogen'),
    phosphorusSlider: document.getElementById('phosphorus'),
    potassiumSlider: document.getElementById('potassium'),
    moistureValue: document.getElementById('moisture-value'),
    nitrogenValue: document.getElementById('nitrogen-value'),
    phosphorusValue: document.getElementById('phosphorus-value'),
    potassiumValue: document.getElementById('potassium-value'),
    analyzeSoilBtn: document.getElementById('analyze-soil'),
    soilResults: document.getElementById('soil-results'),
    soilLoading: document.getElementById('soil-loading'),
    soilGrade: document.getElementById('soil-grade'),
    
    // Sidebar
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebar: document.getElementById('sidebar'),
    closeSidebar: document.getElementById('close-sidebar')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeSliders();
    animateOnScroll();
});

// Event Listeners
function initializeEventListeners() {
    // Crop Health Upload
    elements.cropUpload.addEventListener('click', () => elements.cropFile.click());
    elements.cropFile.addEventListener('change', handleCropUpload);
    setupDragAndDrop(elements.cropUpload, elements.cropFile, handleCropUpload);
    
    // Pest Detection Upload
    elements.pestUpload.addEventListener('click', () => elements.pestFile.click());
    elements.pestFile.addEventListener('change', handlePestUpload);
    setupDragAndDrop(elements.pestUpload, elements.pestFile, handlePestUpload);
    
    // Soil Analysis
    elements.analyzeSoilBtn.addEventListener('click', handleSoilAnalysis);
    
    // Sidebar
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', closeSidebar);
    
    // Navigation smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Drag and Drop Setup
function setupDragAndDrop(uploadZone, fileInput, handler) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handler();
        }
    });
}

// Slider Initialization
function initializeSliders() {
    const sliders = [
        { slider: elements.moistureSlider, value: elements.moistureValue },
        { slider: elements.nitrogenSlider, value: elements.nitrogenValue },
        { slider: elements.phosphorusSlider, value: elements.phosphorusValue },
        { slider: elements.potassiumSlider, value: elements.potassiumValue }
    ];
    
    sliders.forEach(({ slider, value }) => {
        slider.addEventListener('input', () => {
            value.textContent = slider.value;
            updateSliderBackground(slider);
        });
        updateSliderBackground(slider);
    });
}

function updateSliderBackground(slider) {
    const percentage = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(90deg, var(--primary-green) ${percentage}%, var(--border-light) ${percentage}%)`;
}

// Crop Health Analysis
async function handleCropUpload() {
    const file = elements.cropFile.files[0];
    if (!file) return;
    
    showLoading('crop');
    hideElement(elements.cropResult);
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate API call with mock data for demo
        await simulateAPICall(2000);
        const mockResult = {
            class_label: Math.random() > 0.5 ? 'Healthy' : 'Diseased',
            confidence: 0.85 + Math.random() * 0.14,
            note: 'Analysis based on leaf structure and coloration patterns.'
        };
        
        displayCropResult(mockResult);
        
    } catch (error) {
        console.error('Crop analysis error:', error);
        showError('crop', 'Failed to analyze crop health. Please try again.');
    } finally {
        hideLoading('crop');
    }
}

function displayCropResult(result) {
    const isHealthy = result.class_label.toLowerCase() === 'healthy';
    const confidencePercent = Math.round(result.confidence * 100);
    
    elements.cropClass.textContent = result.class_label;
    elements.cropConfidence.textContent = `${confidencePercent}%`;
    elements.cropDetails.textContent = result.note || 'No additional details available.';
    
    // Update status indicator
    elements.cropStatus.textContent = result.class_label;
    elements.cropStatus.className = `status-indicator ${isHealthy ? 'healthy' : 'diseased'}`;
    
    // Update result card styling
    const resultCard = elements.cropResult.querySelector('.result-card');
    resultCard.className = `result-card ${isHealthy ? 'healthy' : 'diseased'}`;
    
    // Show result with animation
    showElement(elements.cropResult, 'slide-up');
    
    // Update current analysis
    currentAnalysis.crop = result;
}

// Pest Detection
async function handlePestUpload() {
    const file = elements.pestFile.files[0];
    if (!file) return;
    
    showLoading('pest');
    hideElement(elements.pestResults);
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate API call with mock data
        await simulateAPICall(2500);
        const mockResult = {
            detections: generateMockPestDetections()
        };
        
        displayPestResults(mockResult);
        
    } catch (error) {
        console.error('Pest detection error:', error);
        showError('pest', 'Failed to detect pests. Please try again.');
    } finally {
        hideLoading('pest');
    }
}

function generateMockPestDetections() {
    const pestTypes = [
        { name: 'Aphids', icon: 'fas fa-bug' },
        { name: 'Spider Mites', icon: 'fas fa-spider' },
        { name: 'Whiteflies', icon: 'fas fa-bug' },
        { name: 'Thrips', icon: 'fas fa-bug' }
    ];
    
    const numDetections = Math.floor(Math.random() * 3) + 1;
    const detections = [];
    
    for (let i = 0; i < numDetections; i++) {
        const pest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
        detections.push({
            class: pest.name,
            confidence: 0.6 + Math.random() * 0.4,
            icon: pest.icon
        });
    }
    
    return detections;
}

function displayPestResults(result) {
    const detections = result.detections || [];
    
    // Update count
    elements.pestCount.textContent = `${detections.length} detected`;
    
    // Clear previous results
    elements.pestResults.innerHTML = '';
    
    if (detections.length === 0) {
        elements.pestResults.innerHTML = `
            <div class="detection-item">
                <i class="fas fa-check-circle" style="color: var(--primary-green);"></i>
                <h4>No Pests Detected</h4>
                <p class="confidence">Your crops look healthy!</p>
            </div>
        `;
    } else {
        detections.forEach(detection => {
            const confidencePercent = Math.round(detection.confidence * 100);
            const detectionElement = document.createElement('div');
            detectionElement.className = 'detection-item';
            detectionElement.innerHTML = `
                <i class="${detection.icon || 'fas fa-bug'}"></i>
                <h4>${detection.class}</h4>
                <p class="confidence">${confidencePercent}% confidence</p>
            `;
            elements.pestResults.appendChild(detectionElement);
        });
    }
    
    // Show results with animation
    showElement(elements.pestResults, 'fade-in');
    
    // Update current analysis
    currentAnalysis.pest = result;
}

// Soil Analysis
async function handleSoilAnalysis() {
    const soilData = {
        moisture: parseFloat(elements.moistureSlider.value),
        nitrogen: parseFloat(elements.nitrogenSlider.value),
        phosphorus: parseFloat(elements.phosphorusSlider.value),
        potassium: parseFloat(elements.potassiumSlider.value)
    };
    
    showLoading('soil');
    hideElement(elements.soilResults);
    
    try {
        // Simulate API call
        await simulateAPICall(1500);
        const mockResult = calculateSoilCondition(soilData);
        
        displaySoilResults(mockResult);
        
    } catch (error) {
        console.error('Soil analysis error:', error);
        showError('soil', 'Failed to analyze soil condition. Please try again.');
    } finally {
        hideLoading('soil');
    }
}

function calculateSoilCondition(data) {
    // Mock calculation logic
    const moistureScore = Math.min((data.moisture / 60) * 100, 100);
    const nitrogenScore = Math.min((data.nitrogen / 60) * 100, 100);
    const phosphorusScore = Math.min((data.phosphorus / 50) * 100, 100);
    const potassiumScore = Math.min((data.potassium / 50) * 100, 100);
    
    const overallScore = Math.round((moistureScore + nitrogenScore + phosphorusScore + potassiumScore) / 4);
    
    let condition;
    if (overallScore >= 80) condition = 'Excellent';
    else if (overallScore >= 60) condition = 'Good';
    else if (overallScore >= 40) condition = 'Moderate';
    else condition = 'Poor';
    
    return {
        soil_condition: condition,
        overall_score: overallScore,
        details: {
            moisture_score: Math.round(moistureScore),
            nitrogen_score: Math.round(nitrogenScore),
            phosphorus_score: Math.round(phosphorusScore),
            potassium_score: Math.round(potassiumScore)
        }
    };
}

function displaySoilResults(result) {
    // Update grade
    elements.soilGrade.textContent = result.soil_condition;
    elements.soilGrade.className = `soil-grade ${result.soil_condition.toLowerCase()}`;
    
    // Update overall score circle
    const overallCircle = document.getElementById('overall-circle');
    const overallScoreElement = document.getElementById('overall-score');
    const scoreAngle = (result.overall_score / 100) * 360;
    
    overallCircle.style.setProperty('--score-angle', `${scoreAngle}deg`);
    overallScoreElement.textContent = result.overall_score;
    
    // Update progress bars
    const nutrients = ['moisture', 'nitrogen', 'phosphorus', 'potassium'];
    nutrients.forEach(nutrient => {
        const progress = document.getElementById(`${nutrient}-progress`);
        const score = document.getElementById(`${nutrient}-score`);
        const value = result.details[`${nutrient}_score`];
        
        setTimeout(() => {
            progress.style.width = `${value}%`;
            score.textContent = `${value}%`;
        }, 300);
    });
    
    // Show results with animation
    showElement(elements.soilResults, 'slide-up');
    
    // Update current analysis
    currentAnalysis.soil = result;
}

// Utility Functions
function showLoading(type) {
    const loadingElement = document.getElementById(`${type}-loading`);
    if (loadingElement) {
        showElement(loadingElement, 'fade-in');
    }
}

function hideLoading(type) {
    const loadingElement = document.getElementById(`${type}-loading`);
    if (loadingElement) {
        hideElement(loadingElement);
    }
}

function showElement(element, animationClass = '') {
    element.style.display = 'block';
    if (animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 500);
    }
}

function hideElement(element) {
    element.style.display = 'none';
}

function showError(type, message) {
    // You can implement error display logic here
    console.error(`${type} error:`, message);
}

function simulateAPICall(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Sidebar Functions
function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
}

// Smooth Scroll Navigation
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Scroll Animations
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.analysis-card').forEach(card => {
        observer.observe(card);
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Export functions for global access
window.scrollToSection = scrollToSection;