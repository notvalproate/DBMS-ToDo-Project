document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('.submit-button');
    const moodRange = document.querySelector('.mood-range');
    const enterDiary = document.querySelector('.enter-diary');
    const oldDiaryContainer = document.querySelector('.old');

    submitButton.addEventListener('click', function () {
        const moodValue = parseInt(moodRange.value);
        const diaryEntry = enterDiary.value;

        let feeling = '';
        if (moodValue >= 1 && moodValue <= 25) {
            feeling = 'Depressed';
        } else if (moodValue >= 26 && moodValue <= 50) {
            feeling = 'Sad';
        } else if (moodValue >= 51 && moodValue <= 75) {
            feeling = 'Okay';
        } else if (moodValue >= 76 && moodValue <= 99) {
            feeling = 'Good';
        } else if (moodValue === 101) {
            feeling = 'Happy';
        }

        const newEntryDiv = document.createElement('div');
        newEntryDiv.classList.add('each-entry');

        const moodParagraph = document.createElement('p');
        moodParagraph.classList.add('dater');
        moodParagraph.textContent = 'Feeling: ' + feeling;
        newEntryDiv.appendChild(moodParagraph);

        const diaryParagraph = document.createElement('p');
        diaryParagraph.textContent = diaryEntry;
        newEntryDiv.appendChild(diaryParagraph);

        oldDiaryContainer.appendChild(newEntryDiv);

        moodRange.value = 0;
        enterDiary.value = '';
    });
});
