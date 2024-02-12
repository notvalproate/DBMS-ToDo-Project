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

        oldDiaryContainer.append(
            `
            <div class="each-entry">
                <p class="dater">Feeling: ${feeling}}</p>
                <p>${diaryEntry}</p>
            </div>
            `
        );

        diaryForm.remove();
    })

   
});