$(document).ready(() => {
    const submitButton = $('.submit-button');
    const moodRange = $('.mood-range');
    const enterDiary = $('.enter-diary');
    const oldDiaryContainer = $('.old');
    const diaryForm = $('.diary');

    submitButton.click(() => {
        const moodValue = parseInt(moodRange.val());
        const diaryEntry = enterDiary.val();

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

        let date = '12 February, 2024';

        oldDiaryContainer.append(
            `
            <div class="each-entry">
                <div class="diary-title">
                    <p class="dater">${date}</p>
                    <p class="dater">Feeling: ${feeling}</p>
                </div>
                <p>${diaryEntry}</p>
            </div>
            `
        );

        diaryForm.remove();
    })

   
});