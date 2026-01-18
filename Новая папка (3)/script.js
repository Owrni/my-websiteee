// DOM элементы
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const generateBtn = document.getElementById('generateBtn');
const checkPasswordBtn = document.getElementById('checkPasswordBtn');
const checkPasswordInput = document.getElementById('checkPasswordInput');
const checkResults = document.getElementById('checkResults');
const resultStrength = document.getElementById('resultStrength');
const resultDetails = document.getElementById('resultDetails');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const strengthValue = document.getElementById('strengthValue');

// Настройки
const includeUppercase = document.getElementById('includeUppercase');
const includeLowercase = document.getElementById('includeLowercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');

// Модальное окно и тема
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const faqBtn = document.getElementById('faqBtn');
const faqModal = document.getElementById('faqModal');
const closeModal = document.getElementById('closeModal');

// Наборы символов
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Инициализация
function init() {
    generatePassword();
    
    // Обновление длины
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });
    
    // Кнопки
    copyBtn.addEventListener('click', copyPassword);
    refreshBtn.addEventListener('click', generatePassword);
    generateBtn.addEventListener('click', generatePassword);
    
    // Проверка пароля
    checkPasswordBtn.addEventListener('click', checkExistingPassword);
    checkPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkExistingPassword();
    });
    
    // Модальное окно
    faqBtn.addEventListener('click', () => {
        faqModal.classList.add('active');
    });
    
    closeModal.addEventListener('click', () => {
        faqModal.classList.remove('active');
    });
    
    faqModal.addEventListener('click', (e) => {
        if (e.target === faqModal) {
            faqModal.classList.remove('active');
        }
    });
    
    // FAQ аккордеон
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            this.parentElement.classList.toggle('active');
        });
    });
    
    // Переключение темы
    themeToggle.addEventListener('click', toggleTheme);
}

// Генерация пароля
function generatePassword() {
    let charset = '';
    const length = parseInt(lengthSlider.value);
    
    if (includeUppercase.checked) charset += charSets.uppercase;
    if (includeLowercase.checked) charset += charSets.lowercase;
    if (includeNumbers.checked) charset += charSets.numbers;
    if (includeSymbols.checked) charset += charSets.symbols;
    
    if (charset === '') {
        charset = charSets.lowercase + charSets.uppercase + charSets.numbers;
        includeUppercase.checked = true;
        includeLowercase.checked = true;
        includeNumbers.checked = true;
    }
    
    const passwordArray = new Uint32Array(length);
    window.crypto.getRandomValues(passwordArray);
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[passwordArray[i] % charset.length];
    }
    
    passwordOutput.value = password;
    updatePasswordStrength(password);
}

// Оценка пароля
function evaluatePasswordStrength(password) {
    let score = 0;
    const feedback = [];
    
    // Длина
    if (password.length >= 16) {
        score += 30;
        feedback.push({ text: "✓ Отличная длина (16+ символов)", good: true });
    } else if (password.length >= 12) {
        score += 25;
        feedback.push({ text: "✓ Хорошая длина (12-15 символов)", good: true });
    } else if (password.length >= 8) {
        score += 15;
        feedback.push({ text: "⚠ Минимальная длина (8-11 символов)", good: true });
    } else {
        feedback.push({ text: "✗ Слишком короткий (менее 8 символов)", good: false });
    }
    
    // Типы символов
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    
    if (hasLowercase) {
        score += 10;
        feedback.push({ text: "✓ Строчные буквы", good: true });
    } else {
        feedback.push({ text: "✗ Нет строчных букв", good: false });
    }
    
    if (hasUppercase) {
        score += 10;
        feedback.push({ text: "✓ Заглавные буквы", good: true });
    } else {
        feedback.push({ text: "✗ Нет заглавных букв", good: false });
    }
    
    if (hasNumbers) {
        score += 10;
        feedback.push({ text: "✓ Цифры", good: true });
    } else {
        feedback.push({ text: "✗ Нет цифр", good: false });
    }
    
    if (hasSymbols) {
        score += 15;
        feedback.push({ text: "✓ Специальные символы", good: true });
    } else {
        feedback.push({ text: "⚠ Нет специальных символов", good: false });
    }
    
    // Проверки на слабости
    if (/(.)\1\1/.test(password)) {
        score -= 10;
        feedback.push({ text: "✗ Есть повторяющиеся символы", good: false });
    }
    
    if (/123|234|345|456|567|678|789|890/.test(password)) {
        score -= 10;
        feedback.push({ text: "✗ Есть цифровые последовательности", good: false });
    }
    
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        score -= 10;
        feedback.push({ text: "✗ Есть буквенные последовательности", good: false });
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return { score, feedback };
}

// Обновление индикатора
function updatePasswordStrength(password) {
    const { score, feedback } = evaluatePasswordStrength(password);
    
    let strengthLevel = '';
    let color = '';
    
    if (score >= 80) {
        strengthLevel = 'Отличный';
        color = 'var(--success-color)';
    } else if (score >= 60) {
        strengthLevel = 'Хороший';
        color = 'var(--info-color)';
    } else if (score >= 40) {
        strengthLevel = 'Средний';
        color = 'var(--warning-color)';
    } else if (score >= 20) {
        strengthLevel = 'Слабый';
        color = 'var(--danger-color)';
    } else {
        strengthLevel = 'Очень слабый';
        color = '#dc3545';
    }
    
    strengthFill.style.width = score + '%';
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = `Надежность: ${strengthLevel}`;
    strengthText.style.color = color;
    strengthValue.textContent = score + '%';
    strengthValue.style.color = color;
}

// Копирование пароля
function copyPassword() {
    if (!passwordOutput.value) {
        alert('Сначала сгенерируйте пароль');
        return;
    }
    
    passwordOutput.select();
    passwordOutput.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Скопировано';
            copyBtn.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }
    } catch (err) {
        alert('Не удалось скопировать пароль');
    }
}

// Проверка существующего пароля
function checkExistingPassword() {
    const password = checkPasswordInput.value.trim();
    
    if (!password) {
        alert('Введите пароль для проверки');
        checkPasswordInput.focus();
        return;
    }
    
    const { score, feedback } = evaluatePasswordStrength(password);
    
    let strengthLevel = '';
    let color = '';
    
    if (score >= 80) {
        strengthLevel = 'Отличный';
        color = 'var(--success-color)';
    } else if (score >= 60) {
        strengthLevel = 'Хороший';
        color = 'var(--info-color)';
    } else if (score >= 40) {
        strengthLevel = 'Средний';
        color = 'var(--warning-color)';
    } else if (score >= 20) {
        strengthLevel = 'Слабый';
        color = 'var(--danger-color)';
    } else {
        strengthLevel = 'Очень слабый';
        color = '#dc3545';
    }
    
    resultStrength.textContent = `Надежность: ${strengthLevel} (${score}%)`;
    resultStrength.style.color = color;
    
    let detailsHTML = '<ul>';
    feedback.forEach(item => {
        const icon = item.good ? '✓' : item.text.includes('⚠') ? '⚠' : '✗';
        const colorClass = item.good ? 'good' : item.text.includes('⚠') ? 'warning' : 'bad';
        detailsHTML += `<li class="${colorClass}">${icon} ${item.text}</li>`;
    });
    detailsHTML += '</ul>';
    
    resultDetails.innerHTML = detailsHTML;
    checkResults.classList.add('active');
}

// Переключение темы
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '🌙';
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', init);