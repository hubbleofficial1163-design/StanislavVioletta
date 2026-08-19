// ==============================================
// СВАДЕБНЫЙ САЙТ - СТАНИСЛАВ & ВИОЛЕТТА
// Интеграция с Google Sheets
// ==============================================

(function() {
    // ========== КОНФИГУРАЦИЯ ==========
    // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ URL ИЗ APPS SCRIPT ⚠️
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqsWC3UeRryYVmtOE3cTKfn63A8li-OBF7ZJCiMuYSxapqg2ylrIepu0LkRbCOLgNW/exec';
    
    let isSubmitting = false;
    
    // ========== БАЗОВЫЕ СТИЛИ АНИМАЦИЙ ==========
    const coreStyles = document.createElement('style');
    coreStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes spinMusic {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(coreStyles);
    
    // ========== УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ==========
    function showModal(title, message, isError = false) {
        const existingModal = document.getElementById('customModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const icon = isError ? '✕' : '✓';
        const iconColor = isError ? '#c62828' : '#2e7d32';
        const bgIconColor = isError ? '#ffebee' : '#e8f5e9';
        const borderColor = isError ? '#c62828' : '#2e7d32';

        modal.innerHTML = `
            <div style="
                background: #ffffff;
                border-radius: 16px;
                padding: 32px 40px;
                max-width: 380px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
                animation: slideUp 0.3s ease;
                border-top: 3px solid ${borderColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${bgIconColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">
                    <div style="
                        font-size: 32px;
                        font-weight: 400;
                        color: ${iconColor};
                        line-height: 1;
                    ">${icon}</div>
                </div>
                <h3 style="
                    font-size: 24px;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin-bottom: 12px;
                    letter-spacing: -0.3px;
                ">${title}</h3>
                <p style="
                    font-size: 16px;
                    color: #555555;
                    margin-bottom: 28px;
                    line-height: 1.5;
                ">${message}</p>
                <button onclick="this.closest('#customModal').remove()" style="
                    background: #f5f5f5;
                    color: #333333;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 40px;
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='#f5f5f5'">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (!isError) {
            setTimeout(() => {
                if (modal.parentElement) modal.remove();
            }, 4000);
        }
    }
    
    // ========== МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ==========
    function showLoadingModal() {
        const existingLoading = document.getElementById('loadingModal');
        if (existingLoading) existingLoading.remove();
        
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        loadingModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 32px 40px;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #595b4e;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="
                    font-size: 15px;
                    color: #4A3F35;
                    margin: 0;
                    font-weight: 500;
                ">Отправка ответа...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        return loadingModal;
    }
    
    // ========== ОТПРАВКА В GOOGLE SHEETS ==========
    async function sendToGoogleSheets(formData) {
        const formBody = new URLSearchParams();
        formBody.append('name', formData.name);
        formBody.append('attendance', formData.attendance);
        for (const alcohol of formData.alcohol) {
            formBody.append('alcohol', alcohol);
        }
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString()
        });
        
        const result = await response.json();
        return result;
    }
    
    // ========== ТАЙМЕР ==========
    function updateTimer() {
        const weddingDate = new Date(2026, 10, 27, 14, 0).getTime();
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days < 10 ? '0' + days : days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    }
    
    // ========== БЕГУЩАЯ СТРОКА ==========
    function initTicker() {
        const tickerElement = document.getElementById('tickerText');
        const container = document.querySelector('.ticker-container');
        if (!tickerElement || !container) return;
        
        const baseText = 'приглашение на свадьбу • ';
        
        function updateTicker() {
            const containerWidth = container.offsetWidth;
            
            const temp = document.createElement('span');
            temp.style.visibility = 'hidden';
            temp.style.position = 'absolute';
            temp.style.whiteSpace = 'nowrap';
            temp.style.fontSize = window.getComputedStyle(tickerElement).fontSize;
            temp.style.fontFamily = window.getComputedStyle(tickerElement).fontFamily;
            temp.style.letterSpacing = window.getComputedStyle(tickerElement).letterSpacing;
            temp.style.fontWeight = window.getComputedStyle(tickerElement).fontWeight;
            temp.textContent = baseText;
            document.body.appendChild(temp);
            
            const textWidth = temp.offsetWidth;
            document.body.removeChild(temp);
            
            const repeatsNeeded = Math.max(3, Math.ceil((containerWidth * 2) / textWidth) + 1);
            
            let fullText = '';
            for (let i = 0; i < repeatsNeeded; i++) {
                fullText += baseText;
            }
            
            tickerElement.textContent = fullText;
        }
        
        updateTicker();
        
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateTicker, 100);
        });
        
        window.addEventListener('orientationchange', function() {
            setTimeout(updateTicker, 150);
        });
    }
    
    // ========== ГАЛЕРЕЯ ==========
    function initGallery() {
        const track = document.getElementById('galleryTrack');
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        const slides = track.querySelectorAll('.gallery-slide');
        let currentIndex = 0;
        const totalSlides = slides.length;
        
        function updateGallery(index) {
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateGallery(currentIndex);
        });
        
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateGallery(currentIndex);
        });
        
        // Свайпы для мобильных
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % totalSlides;
                } else {
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                }
                updateGallery(currentIndex);
            }
        }, { passive: true });
    }
    
    // ========== МУЗЫКА ==========
    function initMusic() {
        const musicBtn = document.getElementById('musicToggle');
        const musicStatus = document.getElementById('musicStatus');
        if (!musicBtn) return;
        
        let audio = null;
        let isPlaying = false;

        function createAudio() {
            if (!audio) {
                audio = new Audio('1.mp3');
                audio.loop = true;
                
                audio.addEventListener('error', function(e) {
                    console.error('Ошибка загрузки музыки:', e);
                    if (musicStatus) musicStatus.textContent = 'Ошибка загрузки';
                    musicBtn.classList.remove('playing');
                    isPlaying = false;
                });
            }
            return audio;
        }

        function toggleMusic() {
            const audioElement = createAudio();
            
            if (isPlaying) {
                audioElement.pause();
                audioElement.currentTime = 0;
                isPlaying = false;
                musicBtn.classList.remove('playing');
                if (musicStatus) musicStatus.textContent = 'Включить музыку';
            } else {
                audioElement.play()
                    .then(() => {
                        isPlaying = true;
                        musicBtn.classList.add('playing');
                        if (musicStatus) musicStatus.textContent = 'Выключить музыку';
                    })
                    .catch(function(error) {
                        console.error('Ошибка воспроизведения:', error);
                        if (musicStatus) musicStatus.textContent = 'Нажмите еще раз';
                    });
            }
        }

        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ФОРМЫ ==========
    function initRSVPForm() {
        const form = document.querySelector('.guest-form');
        if (!form) {
            console.error('❌ Форма .guest-form не найдена!');
            return;
        }
        
        console.log('✅ Форма найдена, инициализация...');
        
        const nameInput = document.getElementById('name');
        const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
        const alcoholCheckboxes = form.querySelectorAll('input[name="alcohol"]');
        const submitBtn = form.querySelector('.submit-btn');
        
        // Убираем старый обработчик
        form.onsubmit = null;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const name = nameInput ? nameInput.value.trim() : '';
            
            let attendance = null;
            attendanceRadios.forEach(radio => {
                if (radio.checked) attendance = radio.value;
            });
            
            // Собираем выбранный алкоголь
            let alcoholValues = [];
            alcoholCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    alcoholValues.push(checkbox.value);
                }
            });
            
            // Валидация
            if (!name) {
                showModal('Ошибка', 'Пожалуйста, введите ваше имя', true);
                if (nameInput) nameInput.focus();
                return;
            }
            
            if (!attendance) {
                showModal('Ошибка', 'Пожалуйста, выберите, сможете ли вы присутствовать', true);
                return;
            }
            
            // Блокируем кнопку
            isSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }
            
            const loadingModal = showLoadingModal();
            
            try {
                const formData = { 
                    name: name, 
                    attendance: attendance,
                    alcohol: alcoholValues
                };
                
                const result = await sendToGoogleSheets(formData);
                
                loadingModal.remove();
                
                if (result.result === 'success') {
                    let responseMessage = '';
                    if (attendance === 'yes') {
                        responseMessage = `Спасибо, ${name}! Будем ждать вас на нашей свадьбе 27 ноября 2026 года! 🎉`;
                    } else {
                        responseMessage = `Спасибо за ответ, ${name}! Очень жаль, что вы не сможете быть с нами.`;
                    }
                    
                    showModal('Ответ отправлен!', responseMessage, false);
                    
                    // Очищаем форму
                    if (nameInput) nameInput.value = '';
                    attendanceRadios.forEach(radio => radio.checked = false);
                    alcoholCheckboxes.forEach(checkbox => checkbox.checked = false);
                    
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                } else {
                    throw new Error(result.message || 'Ошибка отправки');
                }
            } catch (error) {
                loadingModal.remove();
                showModal('Ошибка', error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.', true);
            } finally {
                isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить';
                }
            }
        });
    }
    
    // ========== ЗАПУСК ==========
    document.addEventListener('DOMContentLoaded', function() {
        // Бегущая строка
        initTicker();
        
        // Галерея
        initGallery();
        
        // Таймер
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Музыка
        initMusic();
        
        // Форма
        initRSVPForm();
        
        console.log('✅ Форма RSVP готова к отправке в Google Sheets');
        console.log('📊 URL скрипта:', SCRIPT_URL);
    });
    
})();
