'use strict';

// Библиотека позволяющая генерировать "фальшивые" данные.
import { faker } from 'https://cdn.skypack.dev/@faker-js/faker/locale/ru';
// Импорт функций, необходимых для работы с localStorage
import {
	addToLocalStorage,
	getFromLocalStorage,
	removeFromLocalStorage,
} from './localStorage.js';

// Импорт функций и переменных, необходимых для работы кастомной валидации
import {
	validateForm,
	validateSingleFormGroup,
	validationOptions,
} from './validation.js';

// Получаем форму.
const form = document.querySelector('.form');
// Получаем контейнер для сообщений.
const commentContainer = document.querySelector('.comments-container');
// Ключ, по которому в localStorage хранятся данные.
const localStorageKeyName = 'commentsData';

commentArrayInitialization();
addCommentContainerObserver();
addCommentContainerListeners();
formValidationSetUp();
addFormListeners();

/**
 * Функция считывает данные из localStorage. Если данных нет, выводит
 * диалог с возможностью добавить тестовые данные по нажатию кнопки.
 */
function commentArrayInitialization() {
	let commentArrayString = getFromLocalStorage(localStorageKeyName);
	if (commentArrayString) {
		const commentArray = JSON.parse(commentArrayString);
		// преобразуем строку, содержащую информацию о времени в обьект Date
		const commentArrayCorrectDate = commentArray.map((comment) => {
			return { ...comment, date: new Date(comment.date) };
		});
		renderMultipleComments(commentArrayCorrectDate);
		return;
	}
	printMessageEmptyLocalStore();
}

/**
 * Функция создает обьект MutationObserver, который наблюдает за контейнером,
 * в котором выводятся сообщения. В зависимости от изменений происходят
 * различные действия.
 */
function addCommentContainerObserver() {
	const observer = new MutationObserver(() => {
		const isEmpty = commentContainer.children.length < 1;
		if (isEmpty) {
			removeFromLocalStorage(localStorageKeyName);
			printMessageEmptyLocalStore();
		} else {
			const isMessages =
				!commentContainer.children[0].classList.contains('message-block');
			if (isMessages) {
				addToLocalStorage(localStorageKeyName, commentContainer.children);
			}
			// Если комментарий добавляется из формы, удалить элемент который сообщает,
			// что нет комментариев
			if (!isMessages && commentContainer.children.length > 1) {
				commentContainer.children[0].remove();
			}
		}
	});
	observer.observe(commentContainer, {
		childList: true,
		subtree: true,
		attributes: true,
	});
}

/**
 * Функция, которая добавляет к контейнеру с сообщеними обработчики событий.
 * Событие присходит на элементе, "всплывает" по цепочке наследования и обрабатывается
 * на родителе.
 */
function addCommentContainerListeners() {
	commentContainer.addEventListener('click', (e) => {
		const isLiked = e.target.classList.contains('comment__like');
		const isDeleted = e.target.classList.contains('comment__delete');
		const isAddTestData = e.target.classList.contains('message-block__button');

		if (isDeleted) {
			const comment = e.target.closest('.comment');
			comment.remove();
		}
		console.log('eee');
		if (isLiked) {
			const like = e.target;

			like.classList.toggle('comment__like--filled');
			like.name = like.name === 'heart' ? 'heart-outline' : 'heart';
		}
		// Если происходит нажатие на кнопку "загрузить данные"
		// то генерируются и выводятся на экран тестовые данные.
		if (isAddTestData) {
			const fakeCommentsArray = generateFakeComments(3);
			renderMultipleComments(fakeCommentsArray);
		}
	});
}

/**
 * Функция "настраивает" форму для валидации.
 */
function formValidationSetUp() {
	// Отключаем html валидацию.
	form.setAttribute('novalidate', '');
	// Каждому элементу ввода добавляем обработчик, который проверяет соответствуют ли
	// введенные данные установленным ограничениям. Обработчик срабатывает когда
	// элемент теряет фокус
	Array.from(form.querySelectorAll('input,textarea')).forEach((element) => {
		element.addEventListener('blur', (event) => {
			validateSingleFormGroup(event.target.closest('.form__group'));
		});
		// убираем валидацию при вводе.
		element.addEventListener('input', (event) => {
			event.target.nextElementSibling.innerHTML = '';
		});
	});
}

/**
 * Функция которая добавляет форме обработчик, срабатывающий при ее отправке.
 */
function addFormListeners() {
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const isError = validateForm(form);
		// если форма не прошла валидацию не отправлять
		if (isError) {
			return;
		}

		const inputData = form.querySelectorAll('input,textarea');
		const dateFromInput = inputData[2].value;
		const dateTime = getHoursAndMinutes(new Date());
		const date = dateFromInput
			? new Date(`${inputData[2].value}T${dateTime}`)
			: new Date();
		// Здесь происходит замена управляющих символов (CRLF) на элемент <br>,
		// для того чтобы переход на новую строку корректно отражался на html странице
		const commentText = inputData[1].value.replace(/\n\r?/g, '<br>');
		const data = {
			name: inputData[0].value,
			text: commentText,
			date: date,
			isLiked: false,
		};
		inputData.forEach((element) => {
			element.value = '';
		});
		renderComment(data);
	});
}

/**
 * Функция, производящая вывод комментария на экран
 * @param {{
 * name: string,
 * text: string,
 * date: Date,
 * isLiked: boolean,
 * }} commentData - данные комментария
 */
function renderComment(commentData) {
	const { name, text, date, isLiked } = commentData;
	const stringOfData = dateOutput(date);
	/**
	 * функция пребразующая дату в строку
	 * @param {Date} date - дата
	 * @returns {string}  дата, приведенная к необходимому,
	 * преобразованная в строку
	 */
	function dateOutput(date) {
		const dateTime = getHoursAndMinutes(date);
		const now = new Date();
		const dateFromInput = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate()
		);
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 1
		);

		if (dateFromInput.getTime() === today.getTime()) {
			return `сегодня, ${dateTime}`;
		}
		if (dateFromInput.getTime() === yesterday.getTime()) {
			return `вчера, ${dateTime}`;
		}

		return new Intl.DateTimeFormat('ru-RU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})
			.format(date)
			.toString();
	}

	const comment = document.createElement('div');
	comment.classList.add('comment');
	comment.innerHTML = `
            <div class="comment__header-date-box">
							<h3 class="comment__header">${name}</h3>
							<p class="comment__date">${stringOfData}</p>
						</div>
						<p class="comment__text">
            ${text}
						</p>
						<div class="comment__like-delete-box">
							<ion-icon class="comment__like ${
								isLiked ? 'comment__like--filled' : ''
							}" name=${isLiked ? 'heart' : 'heart-outline'}></ion-icon>
							<ion-icon class="comment__delete" name="trash-outline"></ion-icon>
						</div>
  `;
	commentContainer.append(comment);
}

/**
 * Функция- обертка которая позволяет вывести несколько комментариев на экран
 * @param {[{
 * name: string,
 * text: string,
 * date: Date,
 * isLiked: boolean,
 * }]} commentArray - массив, содержащий данные для создания комментариев
 */
function renderMultipleComments(commentArray) {
	commentContainer.innerHTML = '';
	commentArray.forEach((comment) => {
		renderComment(comment);
	});
}

/**
 * Функция, генерирующая тестовые комментарии
 * @param {number} numberOfComments - количество тестовых комментариев, которые необходимо
 * сгенерировать
 * @returns {[{
 * name: any;
 * text: any;
 * date: any;
 * isLiked: any;
 * }]} массив сгенерированных комментариев
 */
function generateFakeComments(numberOfComments) {
	let commentArray = [];
	const dateNow = new Date();
	dateNow.setHours(5, 0, 0, 0);
	const [month, day, year] = [
		dateNow.getMonth(),
		dateNow.getDate(),
		dateNow.getFullYear(),
	];
	const fakeDate = faker.date.betweens(
		new Date(year, month, day - 2).toISOString(),
		dateNow.toISOString(),
		numberOfComments
	);

	for (let i = 0; i < numberOfComments; i++) {
		const comment = {
			name: faker.name.fullName().split(' ')[0],
			text: faker.lorem.lines(),
			date: fakeDate[i],
			isLiked: faker.datatype.boolean(),
		};
		commentArray.push(comment);
	}
	return commentArray;
}
/**
 * Функция, преобразующая время из даты к заданному виду
 * @param {Date} date - дата в формате Date
 * @returns {string}  время преобразованное к заданному виду
 */
function getHoursAndMinutes(date) {
	return new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
/**
 * Функция, которая выводит сообщение о том что комментариев нет.
 * По нажатию на кнопку, происходит генерация тестовых данных
 */
function printMessageEmptyLocalStore() {
	commentContainer.innerHTML = `
	<div class="message-block">
	<p class="message-block__text">
		Нет комментариев. Вы можете добавить комментарий, используя форму
		ниже &darr; или загрузить тестовые данные.
	</p>
	<button class="button message-block__button">загрузить данные</button>
</div>
`;
}
