// Story Slider functionality
function initializeStorySlider() {
    const storyCarousel = document.querySelector('.story-carousel');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const storyCards = document.querySelectorAll('.story-card');
    const paginationContainer = document.querySelector('.slider-pagination');

    let currentIndex = 0;
    let cardWidth;
    let cardsToShow;
    let maxIndex;

    // Calculate dimensions
    function updateDimensions() {
        const containerWidth = document.querySelector('.story-slider-container').offsetWidth - 120;
        
        // Determine number of cards to show
        if (window.innerWidth >= 1200) {
            cardsToShow = 3;
        } else if (window.innerWidth >= 768) {
            cardsToShow = 2;
        } else {
            cardsToShow = 1;
        }

        // Calculate card width including margin
        cardWidth = (containerWidth / cardsToShow);
        // Update maxIndex to prevent blank spaces
        maxIndex = storyCards.length - cardsToShow;

        // Update card widths
        storyCards.forEach(card => {
            card.style.width = `${cardWidth - 20}px`; // Subtract margin
            card.style.marginRight = '20px'; // Add consistent margin
        });

        // Ensure current index is valid
        currentIndex = Math.min(Math.max(0, currentIndex), maxIndex);
        slideToIndex(currentIndex, false);
    }

    // Slide to specific index
    function slideToIndex(index, animate = true) {
        // Prevent sliding beyond bounds
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        
        // Calculate the exact translation
        const translateX = currentIndex * cardWidth;
        
        // Apply or remove transition based on animate parameter
        storyCarousel.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
        storyCarousel.style.transform = `translateX(-${translateX}px)`;
        
        // If transition was removed, restore it after transform
        if (!animate) {
            setTimeout(() => {
                storyCarousel.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
        }

        updatePagination();
        updateArrowStates();
    }

    // Update pagination dots
    function updatePagination() {
        const dots = document.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Update arrow states
    function updateArrowStates() {
        prevArrow.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextArrow.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
        prevArrow.disabled = currentIndex === 0;
        nextArrow.disabled = currentIndex === maxIndex;
    }

    // Create pagination dots
    function createPagination() {
        paginationContainer.innerHTML = '';
        // Only create dots for valid slide positions
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot';
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => slideToIndex(i));
            paginationContainer.appendChild(dot);
        }
    }

    // Event listeners
    prevArrow.addEventListener('click', () => {
        if (currentIndex > 0) {
            slideToIndex(currentIndex - 1);
        }
    });

    nextArrow.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            slideToIndex(currentIndex + 1);
        }
    });

    // Add touch support
    let touchStartX = 0;
    let touchEndX = 0;

    storyCarousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        storyCarousel.style.transition = 'none';
    });

    storyCarousel.addEventListener('touchmove', (e) => {
        const currentTouch = e.changedTouches[0].screenX;
        const diff = touchStartX - currentTouch;
        
        // Prevent overscrolling
        if (
            (currentIndex === 0 && diff < 0) || 
            (currentIndex === maxIndex && diff > 0)
        ) {
            return;
        }
        
        storyCarousel.style.transform = `translateX(-${(currentIndex * cardWidth) + diff}px)`;
    });

    storyCarousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        storyCarousel.style.transition = 'transform 0.5s ease-in-out';
        
        if (Math.abs(diff) > cardWidth / 3) {
            if (diff > 0 && currentIndex < maxIndex) {
                slideToIndex(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                slideToIndex(currentIndex - 1);
            } else {
                slideToIndex(currentIndex);
            }
        } else {
            slideToIndex(currentIndex);
        }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateDimensions();
            createPagination();
        }, 250);
    });

    // Initialize slider
    updateDimensions();
    createPagination();
}

// Profile Filter functionality
function initializeProfileFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const profiles = document.querySelectorAll('.profile-example');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    let visibleCount = 3; // Initial number of visible profiles

    // Filter profiles
    function filterProfiles(category) {
        let matchingProfiles = Array.from(profiles).filter(profile => 
            category === 'all' || profile.dataset.category.includes(category)
        );

        // Hide all profiles first
        profiles.forEach(profile => {
            profile.style.display = 'none';
        });

        // Show only the first 'visibleCount' matching profiles
        matchingProfiles.slice(0, visibleCount).forEach(profile => {
            profile.style.display = 'block';
            profile.style.animation = 'fadeIn 0.5s ease forwards';
        });

        // Show/hide load more button
        loadMoreBtn.style.display = matchingProfiles.length > visibleCount ? 'block' : 'none';
    }

    // Load more functionality
    loadMoreBtn.addEventListener('click', () => {
        visibleCount += 3; // Increase visible count by 3
        const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterProfiles(currentFilter);
    });

    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Reset visible count when changing filters
            visibleCount = 3;
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply filter
            filterProfiles(button.dataset.filter);
        });
    });

    // Initialize with 'all' filter
    filterProfiles('all');
}

// Profile Actions functionality
function initializeProfileActions() {
    const likeButtons = document.querySelectorAll('.like-btn');
    const messageButtons = document.querySelectorAll('.message-btn');

    // Like functionality
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isLiked = this.classList.contains('liked');
            
            // Toggle like state
            if (isLiked) {
                this.classList.remove('liked');
                this.querySelector('i').classList.remove('fas');
                this.querySelector('i').classList.add('far');
            } else {
                this.classList.add('liked');
                this.querySelector('i').classList.remove('far');
                this.querySelector('i').classList.add('fas');
                
                // Show like animation
                showLikeAnimation(this);
            }
        });
    });

    // Message functionality
    messageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const profileCard = this.closest('.profile-example');
            const profileName = profileCard.querySelector('.profile-header h3').textContent;
            
            // Show chat modal
            showChatModal(profileName);
        });
    });

    // Like animation
    function showLikeAnimation(button) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        button.appendChild(heart);

        setTimeout(() => heart.remove(), 1000);
    }

    // Chat modal
    function showChatModal(profileName) {
        const modal = document.createElement('div');
        modal.className = 'chat-modal';
        modal.innerHTML = `
            <div class="chat-content">
                <div class="chat-header">
                    <h3>Chat with ${profileName}</h3>
                    <button class="close-chat"><i class="fas fa-times"></i></button>
                </div>
                <div class="chat-messages">
                    <div class="chat-placeholder">
                        <i class="far fa-comments"></i>
                        <p>Start a conversation</p>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message...">
                    <button class="send-message"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button functionality
        modal.querySelector('.close-chat').addEventListener('click', () => {
            modal.remove();
        });

        // Send message functionality
        const input = modal.querySelector('input');
        const sendButton = modal.querySelector('.send-message');
        const messagesContainer = modal.querySelector('.chat-messages');

        function sendMessage() {
            const message = input.value.trim();
            if (message) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message sent';
                messageElement.innerHTML = `
                    <p>${message}</p>
                    <span class="time">${new Date().toLocaleTimeString()}</span>
                `;
                messagesContainer.appendChild(messageElement);
                input.value = '';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Remove placeholder if it exists
                const placeholder = messagesContainer.querySelector('.chat-placeholder');
                if (placeholder) placeholder.remove();
            }
        }

        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

// Get Started functionality
function initializeGetStarted() {
    const getStartedBtn = document.querySelector('.cta-btn');
    
    getStartedBtn.addEventListener('click', () => {
        // Show login overlay
        const loginOverlay = document.getElementById('loginOverlay');
        loginOverlay.style.display = 'flex';
        
        // Switch to signup tab
        const signupTab = document.querySelector('[data-tab="signup"]');
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        
        // Update active states
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        signupTab.classList.add('active');
        
        // Show signup form
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        
        // Add animation
        signupForm.style.animation = 'fadeIn 0.3s ease forwards';
    });

    // Add social login handlers
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.classList.contains('google') ? 'google' :
                           button.classList.contains('facebook') ? 'facebook' :
                           button.classList.contains('apple') ? 'apple' : '';
            
            // Handle social login based on platform
            switch(platform) {
                case 'google':
                    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth';
                    break;
                case 'facebook':
                    window.location.href = 'https://www.facebook.com/v12.0/dialog/oauth';
                    break;
                case 'apple':
                    window.location.href = 'https://appleid.apple.com/auth/authorize';
                    break;
            }
        });
    });
}

// Update the chatbot initialization with more advanced features
function initializeChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatInput = document.querySelector('.chatbot-input input');
    const sendBtn = document.querySelector('.send-btn');
    const messagesContainer = document.querySelector('.chatbot-messages');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const closeBtn = document.querySelector('.close-btn');

    let isOpen = false;

    // Predefined responses for common questions
    const responses = {
        greetings: [
            "Hello! How can I help you today?",
            "Hi there! Welcome to HeartMatch. What can I assist you with?",
            "Welcome! How may I help you find your perfect match?"
        ],
        premium: [
            "Our Premium membership includes:\n- Unlimited messaging\n- See who likes you\n- Advanced filters\n- Priority matching\n\nWould you like to learn more about pricing?",
        ],
        safety: [
            "Your safety is our top priority. We have:\n- Profile verification\n- 24/7 monitoring\n- Secure messaging\n- Report system\n\nRead more about our safety measures in our Safety Center.",
        ],
        account: [
            "To create an account:\n1. Click 'Get Started'\n2. Fill in your details\n3. Verify your email\n4. Complete your profile\n\nNeed help with registration?",
        ],
        default: [
            "I'll connect you with our support team for more detailed assistance. In the meantime, you can check our FAQ section.",
            "Let me help you with that. Could you please provide more details about your question?",
            "I understand your question. Would you like me to connect you with a human representative?"
        ]
    };

    function getResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
            return getRandomResponse(responses.greetings);
        }
        else if (msg.includes('premium') || msg.includes('membership') || msg.includes('subscribe')) {
            return getRandomResponse(responses.premium);
        }
        else if (msg.includes('safe') || msg.includes('security') || msg.includes('protect')) {
            return getRandomResponse(responses.safety);
        }
        else if (msg.includes('account') || msg.includes('register') || msg.includes('sign up')) {
            return getRandomResponse(responses.account);
        }
        return getRandomResponse(responses.default);
    }

    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function toggleChatbot() {
        isOpen = !isOpen;
        chatbotContainer.style.display = isOpen ? 'block' : 'none';
        if (isOpen) {
            const badge = document.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
            // Auto-focus the input when opening
            chatInput.focus();
        }
    }

    function sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.innerHTML = `
            <div class="content">
                <p>${message}</p>
                <span class="time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        messagesContainer.appendChild(userMessageDiv);

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Get appropriate response
        const botResponse = getResponse(message);

        // Simulate bot response after typing delay
        setTimeout(() => {
            messagesContainer.removeChild(typingDiv);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = `
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="content">
                    <p>${botResponse}</p>
                    <span class="time">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Add suggested actions if available
            if (message.toLowerCase().includes('premium')) {
                addSuggestedActions(['View Pricing', 'Compare Plans', 'Start Free Trial']);
            } else if (message.toLowerCase().includes('account')) {
                addSuggestedActions(['Create Account', 'Reset Password', 'Contact Support']);
            }
        }, 1000);

        // Clear input
        chatInput.value = '';
    }

    function addSuggestedActions(actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'suggested-actions';
        actionsDiv.innerHTML = actions.map(action => 
            `<button class="action-btn">${action}</button>`
        ).join('');
        messagesContainer.appendChild(actionsDiv);
        
        // Add click handlers for suggested actions
        actionsDiv.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => sendMessage(btn.textContent));
        });
    }

    // Event listeners
    chatbotToggle.addEventListener('click', toggleChatbot);
    minimizeBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });

    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen && 
            !chatbotContainer.contains(e.target) && 
            !chatbotToggle.contains(e.target)) {
            toggleChatbot();
        }
    });

    // Add welcome message when chat is first opened
    chatbotToggle.addEventListener('click', () => {
        if (!messagesContainer.children.length) {
            setTimeout(() => {
                sendMessage("Hi! 👋");
            }, 500);
        }
    });
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeStorySlider); 

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGetStarted();
    initializeProfileFilters();
    initializeProfileActions();
    initializeChatbot();
}); 
