/**
 * Функции, для работы с localStorage*
 */

/**
 * Функция, добавляющая данные в localStorage
 * @param {string} keyName - ключ, по которому хранятся данные
 * @param {string} comments - данные
 */
export function addToLocalStorage(keyName, comments) {
	const commentDataArray = [];
	Array.from(comments).forEach((comment) => {
		const {
			0: {
				children: {
					0: { innerText: name },
					1: { innerText: date },
				},
			},
			1: { innerText: text },
			2: {
				children: { 0: like },
			},
		} = comment.children;
		const isLiked = like.classList.contains('comment__like--filled');
		const [dateCase, minHoursString] = date.split(',');
		const today = new Date();
		let formattedDate;
		let minHours;

		switch (dateCase) {
			case 'сегодня':
				minHours = minHoursString.split(':');
				formattedDate = today.setHours(minHours[0], minHours[1]);
				break;
			case 'вчера':
				minHours = minHoursString.split(':');
				formattedDate = new Date(today);
				formattedDate.setDate(formattedDate.getDate() - 1);
				formattedDate = formattedDate.setHours(minHours[0], minHours[1]);
				break;
			default:
				formattedDate = new Date(dateCase);
				break;
		}

		const commentData = {
			name,
			text,
			date: formattedDate,
			isLiked,
		};
		commentDataArray.push(commentData);
		const commentDataString = JSON.stringify(commentDataArray);
		localStorage.setItem(keyName, commentDataString);
	});
}

/**
 * Функция, получающая данные из localStorage
 * @param {string} keyName - ключ, по которому хранятся данные
 * @returns {string} данные из локального хранилища
 */
export function getFromLocalStorage(keyName) {
	return localStorage.getItem(keyName);
}

/**
 * Функция, удаляющая данные из localStorage
 * @param {string} keyName - ключ, по которому хранятся данные
 */
export function removeFromLocalStorage(keyName) {
	localStorage.removeItem(keyName);
}
