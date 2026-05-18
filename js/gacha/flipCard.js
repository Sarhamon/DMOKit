export function flipCardWrap(backInnerHTML, gradeClass, extraClasses = '', data = {}) {
    const dataAttrs = Object.entries(data)
        .map(([k, v]) => `data-${k}="${v}"`)
        .join(' ');
    return `<div class="result-card flip-card ${gradeClass} ${extraClasses}" role="button" tabindex="0" ${dataAttrs} aria-label="결과 카드 - 클릭하여 공개">
        <div class="flip-inner">
            <div class="flip-front"><span class="flip-mark">?</span></div>
            <div class="flip-back">${backInnerHTML}</div>
        </div>
    </div>`;
}

export function revealAllRowHTML() {
    return `<div class="reveal-all-row"><button type="button" class="reveal-all-btn">전체 공개</button></div>`;
}

export function setupFlip(container, onReveal) {
    const reveal = card => {
        if (card.classList.contains('revealed')) return;
        card.classList.add('revealed');
        if (onReveal) onReveal(card);
    };
    container.querySelectorAll('.flip-card:not(.revealed)').forEach(card => {
        card.addEventListener('click', () => reveal(card));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                reveal(card);
            }
        });
    });
    const revealBtn = container.querySelector('.reveal-all-btn');
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            container.querySelectorAll('.flip-card:not(.revealed)').forEach((card, i) => {
                setTimeout(() => reveal(card), i * 80);
            });
        });
    }
}
