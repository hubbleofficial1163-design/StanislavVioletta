// script.js
document.addEventListener('DOMContentLoaded', function() {
    const tickerElement = document.getElementById('tickerText');
    const container = document.querySelector('.ticker-container');
    initSimpleGallery();
    
    // Текст бегущей строки с разделителем
    const baseText = 'приглашение на свадьбу • ';
    
    // Функция для обновления бегущей строки
    function updateTicker() {
        if (!container || !tickerElement) return;
        
        const containerWidth = container.offsetWidth;
        
        // Создаем временный элемент для измерения ширины текста
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
        
        // Рассчитываем сколько раз нужно повторить текст
        const repeatsNeeded = Math.max(3, Math.ceil((containerWidth * 2) / textWidth) + 1);
        
        // Создаем финальный текст
        let fullText = '';
        for (let i = 0; i < repeatsNeeded; i++) {
            fullText += baseText;
        }
        
        tickerElement.textContent = fullText;
    }
    
    // Добавляем ключевые кадры если их нет
    if (!document.querySelector('#ticker-styles')) {
        const style = document.createElement('style');
        style.id = 'ticker-styles';
        style.textContent = `
            @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Инициализация
    updateTicker();
    
    // Обновляем при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateTicker, 100);
    });
    
    // Обновляем при повороте экрана
    window.addEventListener('orientationchange', function() {
        setTimeout(updateTicker, 150);
    });
    
    // Проверяем видимость имен на разных экранах
    console.log('Hero секция загружена. Проверьте отображение имен на вашем устройстве.');
    
    // Инициализация обработчика формы
    initFormHandler();
});

// Таймер обратного отсчета до свадьбы
function weddingTimer() {
    // Установите дату свадьбы (год, месяц-1, день, часы, минуты)
    const weddingDate = new Date(2026, 10, 27, 14, 0); // 2 июля 2026, 15:00
    
    function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            // Если дата уже прошла
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        // Расчет дней, часов, минут и секунд
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Обновление DOM с добавлением ведущего нуля
        document.getElementById('days').textContent = days < 10 ? '0' + days : days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    }
    
    // Обновляем каждую секунду
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Функция для отправки данных в Google Sheets
async function submitFormToGoogleSheets(formData) {
    // TODO: Замените этот URL на ваш URL веб-приложения Google Apps Script
    const scriptURL = 'https://scriam9f7C/exec';
    
    try {
        const formDataToSend = new FormData();
        
        // Добавляем все данные формы
        formDataToSend.append('name', formData.name || '');
        formDataToSend.append('attendance', formData.attendance || '');
        formDataToSend.append('alcohol', formData.alcohol || '');
        
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Важно для Google Apps Script
            body: formDataToSend
        });
        
        // При no-cors мы не можем прочитать ответ
        return { success: true };
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        throw error;
    }
}

// Функция для сбора данных из формы
function collectFormData(form) {
    // Получаем имя
    const nameInput = form.querySelector('#name');
    const name = nameInput ? nameInput.value.trim() : '';
    
    // Получаем значение радио-кнопок (присутствие)
    const attendanceRadio = form.querySelector('input[name="attendance"]:checked');
    const attendance = attendanceRadio ? attendanceRadio.value : '';
    
    // Получаем выбранные чекбоксы алкоголя
    const alcoholCheckboxes = form.querySelectorAll('input[name="alcohol"]:checked');
    const alcoholValues = Array.from(alcoholCheckboxes).map(cb => cb.value);
    const alcohol = alcoholValues.join(', ');
    
    return {
        name: name,
        attendance: attendance,
        alcohol: alcohol
    };
}

// Функция валидации формы
function validateForm(formData) {
    if (!formData.name) {
        alert('Пожалуйста, введите ваше имя');
        return false;
    }
    
    if (!formData.attendance) {
        alert('Пожалуйста, укажите, сможете ли вы присутствовать');
        return false;
    }
    
    return true;
}

// Функция для очистки формы
function resetForm(form) {
    form.reset();
}

// Функция для отображения сообщения об успехе
function showSuccessMessage(guestName) {
    // Создаем элемент для сообщения
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="success-content">
            <svg class="success-icon" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#4CAF50" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3>Спасибо, ${guestName}!</h3>
            <p>Ваш ответ получен. Ждем вас на свадьбе!</p>
            <button class="success-close-btn" onclick="this.parentElement.parentElement.remove()">Закрыть</button>
        </div>
    `;
    
    // Добавляем стили для сообщения
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .success-icon {
            margin-bottom: 20px;
        }
        
        .success-content h3 {
            font-family: 'Tangerine', 'Great Vibes', cursive;
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 400;
        }
        
        .success-content p {
            font-family: 'Caveat', cursive;
            font-size: 1.3rem;
            color: #666;
            margin-bottom: 25px;
        }
        
        .success-close-btn {
            background-color: #595b4e;
            color: white;
            border: none;
            padding: 12px 35px;
            border-radius: 50px;
            font-family: 'Caveat', cursive;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .success-close-btn:hover {
            background-color: #333;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Функция для отображения сообщения об ошибке
function showErrorMessage() {
    alert('Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с организатором.');
}

// Основной обработчик формы
function initFormHandler() {
    const form = document.querySelector('.guest-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получаем кнопку отправки
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Собираем и валидируем данные
        const formData = collectFormData(form);
        
        if (!validateForm(formData)) {
            return;
        }
        
        // Блокируем кнопку и показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
            // Отправляем данные
            await submitFormToGoogleSheets(formData);
            
            // Показываем сообщение об успехе
            showSuccessMessage(formData.name || 'Гость');
            
            // Очищаем форму
            resetForm(form);
            
        } catch (error) {
            console.error('Ошибка:', error);
            showErrorMessage();
        } finally {
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Запускаем таймер после загрузки страницы
document.addEventListener('DOMContentLoaded', weddingTimer);

function initSimpleGallery() {
    const track = document.getElementById('galleryTrack');
    const nextBtn = document.getElementById('galleryNext');
    
    if (!track || !nextBtn) return;
    
    let currentIndex = 0;
    const totalSlides = 2; // У нас 2 фото
    
    nextBtn.addEventListener('click', () => {
        // Переключаемся на следующее фото (по кругу)
        currentIndex = (currentIndex + 1) % totalSlides;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
}

// Галерея для дресс-кода с двумя стрелками
function initGallery() {
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const totalSlides = 2; // У нас 2 фото
    
    // Функция обновления позиции
    function updateGallery(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Обработчик для стрелки вправо
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateGallery(currentIndex);
    });
    
    // Обработчик для стрелки влево
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateGallery(currentIndex);
    });
    
    // Поддержка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - следующее фото
                currentIndex = (currentIndex + 1) % totalSlides;
            } else {
                // Свайп вправо - предыдущее фото
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            }
            updateGallery(currentIndex);
        }
    }
}

// Инициализируем галерею после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // ... существующий код ...
    
    // Добавьте эту строку
    initGallery();
});



// ===== ЗАГРУЗКА PDF ИЗ ЛОКАЛЬНОЙ ПАПКИ =====

// Подключаем PDF.js
const pdfScript = document.createElement('script');
pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
document.head.appendChild(pdfScript);

let pdfLoaded = false;

pdfScript.onload = function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfLoaded = true;
};

function loadPDF() {
    const container = document.getElementById('pdfContainer');
    if (!container) return;
    
    if (!pdfLoaded) {
        container.innerHTML = '<div style="text-align:center;padding:40px;font-family:Caveat,cursive;font-size:1.5rem;color:#666;">Загрузка PDF.js...</div>';
        setTimeout(loadPDF, 500);
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:40px;font-family:Caveat,cursive;font-size:1.5rem;color:#666;">Загрузка PDF...</div>';
    
    // ЗАГРУЖАЕМ ИЗ ТОЙ ЖЕ ПАПКИ
    pdfjsLib.getDocument('flower-subscription.pdf').promise
        .then(function(pdf) {
            container.innerHTML = '';
            
            let renderPromises = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                renderPromises.push(
                    pdf.getPage(pageNum).then(function(page) {
                        const canvas = document.createElement('canvas');
                        container.appendChild(canvas);
                        
                        const viewport = page.getViewport({ scale: 1.2 });
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        return page.render({
                            canvasContext: canvas.getContext('2d'),
                            viewport: viewport
                        }).promise;
                    })
                );
            }
            return Promise.all(renderPromises);
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            container.innerHTML = '<div style="text-align:center;padding:40px;font-family:Caveat,cursive;font-size:1.5rem;color:#666;">Не удалось загрузить PDF. <br>Файл должен называться <b>flower-subscription.pdf</b> и лежать в той же папке.</div>';
        });
}

// ОТКРЫТИЕ МОДАЛКИ
document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openPdfBtn');
    const modal = document.getElementById('pdfModal');
    const closeBtn1 = document.getElementById('closePdfBtn');
    const closeBtn2 = document.getElementById('closePdfBtn2');

    if (openBtn) {
        openBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                setTimeout(loadPDF, 300);
            }
        });
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
});



// ===== МУЗЫКА =====

document.addEventListener('DOMContentLoaded', function() {
    const musicBtn = document.getElementById('musicToggle');
    const musicStatus = document.getElementById('musicStatus');
    let audio = null;
    let isPlaying = false;

    function createAudio() {
        if (!audio) {
            audio = new Audio('1.mp3');
            audio.loop = true;
            
            // Обработка ошибок
            audio.addEventListener('error', function(e) {
                console.error('Ошибка загрузки музыки:', e);
                musicStatus.textContent = 'Ошибка загрузки';
                musicBtn.classList.remove('playing');
                isPlaying = false;
            });
        }
        return audio;
    }

    function toggleMusic() {
        const audioElement = createAudio();
        
        if (isPlaying) {
            // Остановка
            audioElement.pause();
            audioElement.currentTime = 0;
            isPlaying = false;
            musicBtn.classList.remove('playing');
            musicStatus.textContent = 'Включить музыку';
        } else {
            // Воспроизведение
            audioElement.play()
                .then(() => {
                    isPlaying = true;
                    musicBtn.classList.add('playing');
                    musicStatus.textContent = 'Выключить музыку';
                })
                .catch(function(error) {
                    console.error('Ошибка воспроизведения:', error);
                    musicStatus.textContent = 'Нажмите еще раз';
                    // Пробуем еще раз при следующем клике
                });
        }
    }

    // Клик по кнопке
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }

    // Автозапуск музыки (работает только если пользователь уже взаимодействовал со страницей)
    // Раскомментируйте если нужно автоматическое воспроизведение после любого клика
    /*
    document.addEventListener('click', function autoPlay() {
        if (!isPlaying) {
            const audioElement = createAudio();
            audioElement.play()
                .then(() => {
                    isPlaying = true;
                    musicBtn.classList.add('playing');
                    musicStatus.textContent = 'Выключить музыку';
                    document.removeEventListener('click', autoPlay);
                })
                .catch(() => {});
        }
    }, { once: true });
    */
});
