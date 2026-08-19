// ==============================================
// СВАДЕБНЫЙ САЙТ - ТИМУР & НАТАЛЬЯ
// Интеграция с Google Sheets
// ==============================================

(function() {
    // ========== КОНФИГУРАЦИЯ ==========
    // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ URL ИЗ APPS SCRIPT ⚠️
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlySYrn_wM_cNF3OM03M7W244KwDmiBYb5lqZBVyNS6jE5uH4s-aNcM0gKIWOA0Mv_/exec';
    
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
                    border-top-color: #C9B89B;
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
// ========== ОТПРАВКА В GOOGLE SHEETS ==========
async function sendToGoogleSheets(formData) {
    const formBody = new URLSearchParams();
    formBody.append('name', formData.name);
    formBody.append('attendance', formData.attendance);
    if (formData.food) formBody.append('food', formData.food);
    if (formData.allergies) formBody.append('allergies', formData.allergies);
    // ИЗМЕНЕНО: отправляем каждый напиток отдельно
    for (const drink of formData.drinks) {
        formBody.append('drinks', drink);
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
        const weddingDate = new Date(2026, 8, 24, 15, 0).getTime();
        const now = new Date().getTime();
        let distance = weddingDate - now;

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
    
    // ========== СКРЫТИЕ ZERO-БЛОКА ==========
    function initZeroBlock() {
        const zeroBlock = document.getElementById('zero-block');
        if (zeroBlock) {
            zeroBlock.addEventListener('click', function() {
                this.classList.add('hidden');
                setTimeout(function() {
                    zeroBlock.style.display = 'none';
                }, 800);
            });
        }
    }
    
    // ========== МУЗЫКА ==========
    function initMusic() {
        const musicBtn = document.getElementById('musicToggleBtn');
        if (!musicBtn) return;
        
        let musicStarted = false;
        let audio = null;
        
        musicBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (!musicStarted) {
                audio = new Audio('1.mp3');
                audio.loop = true;
                
                audio.play().then(() => {
                    musicStarted = true;
                    musicBtn.textContent = '♪ Музыка играет';
                    musicBtn.classList.add('playing');
                }).catch(function(error) {
                    console.log('Ошибка воспроизведения:', error);
                    musicBtn.textContent = '♪ Нажмите ещё раз';
                });
            } else {
                if (audio.paused) {
                    audio.play();
                    musicBtn.textContent = '♪ Музыка играет';
                    musicBtn.classList.add('playing');
                } else {
                    audio.pause();
                    musicBtn.textContent = '♪ Музыка на паузе';
                    musicBtn.classList.remove('playing');
                }
            }
        });
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ФОРМЫ ==========
function initRSVPForm() {
    const form = document.querySelector('.final-form');
    if (!form) {
        console.error('❌ Форма .final-form не найдена!');
        return;
    }
    
    console.log('✅ Форма найдена, инициализация...');
    
    const nameInput = document.getElementById('guestName');
    const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
    const foodRadios = form.querySelectorAll('input[name="food"]');
    // ИЗМЕНЕНО: собираем чекбоксы вместо радио
    const drinkCheckboxes = form.querySelectorAll('input[name="drinks"]');
    const allergiesInput = document.getElementById('allergies');
    const submitBtn = form.querySelector('.final-btn');
    
    // Убираем старый обработчик submit
    form.onsubmit = null;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        const name = nameInput ? nameInput.value.trim() : '';
        
        let attendance = null;
        attendanceRadios.forEach(radio => {
            if (radio.checked) attendance = radio.value;
        });
        
        let food = null;
        foodRadios.forEach(radio => {
            if (radio.checked) food = radio.value;
        });
        
        // ИЗМЕНЕНО: собираем ВСЕ выбранные напитки в массив
        let drinkValues = [];
        drinkCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                drinkValues.push(checkbox.value);
            }
        });
        
        const allergies = allergiesInput ? allergiesInput.value.trim() : '';
        
        // Валидация
        if (!name) {
            showModal('Ошибка', 'Пожалуйста, введите ваше имя и фамилию', true);
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
                food: food,
                drinks: drinkValues, // ИЗМЕНЕНО: массив вместо одного значения
                allergies: allergies
            };
            
            const result = await sendToGoogleSheets(formData);
            
            loadingModal.remove();
            
            if (result.result === 'success') {
                let responseMessage = '';
                if (attendance === 'yes') {
                    responseMessage = `Спасибо, ${name}! Будем ждать вас на нашей свадьбе 24 сентября 2026 года! 🎉`;
                } else {
                    responseMessage = `Спасибо за ответ, ${name}! Очень жаль, что вы не сможете быть с нами.`;
                }
                
                showModal('Ответ отправлен!', responseMessage, false);
                
                // Очищаем форму
                if (nameInput) nameInput.value = '';
                attendanceRadios.forEach(radio => radio.checked = false);
                foodRadios.forEach(radio => radio.checked = false);
                // ИЗМЕНЕНО: очищаем чекбоксы
                drinkCheckboxes.forEach(checkbox => checkbox.checked = false);
                if (allergiesInput) allergiesInput.value = '';
                
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
                submitBtn.textContent = 'ОТПРАВИТЬ ОТВЕТ';
            }
        }
    });
}
    
    // ========== ЗАПУСК ==========
    document.addEventListener('DOMContentLoaded', function() {
        // Hero анимация
        const container = document.querySelector('.hero-section .container');
        if (container) {
            setTimeout(() => {
                container.classList.add('visible');
            }, 100);
        }
        
        // Таймер
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Zero блок
        initZeroBlock();
        
        // Музыка
        initMusic();
        
        // Форма
        initRSVPForm();
        
        console.log('✅ Форма RSVP готова к отправке в Google Sheets');
        console.log('📊 URL скрипта:', SCRIPT_URL);
    });
    
})();
