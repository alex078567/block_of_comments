'use strict';
/**
 * Функции и переменные, необходимые для того, чтобы работала кастомная валидация.
 */

/**
 * Массив содержащий различные проверки для поля ввода, в зависимости
 * от атрибутов этого поля.
 */
export const validationOptions = [
	{
		attribute: 'minlength',
		isValid: (input) =>
			input.value && input.value.length >= parseInt(input.minLength, 10),
		errorMessage: (input, label) =>
			`Поле "${label.textContent.slice(0, -1)}" должно быть не короче ${
				input.minLength
			} символов`,
	},
	{
		attribute: 'custommaxlength',
		isValid: (input) => {
			const maxLength = parseInt(input.getAttribute('custommaxlength'), 10);
			return input.value && input.value.length <= maxLength;
		},
		errorMessage: (input, label) => {
			const maxLength = parseInt(input.getAttribute('custommaxlength'), 10);
			return `Поле "${label.textContent.slice(
				0,
				-1
			)}"  не может содержать более ${maxLength} символов`;
		},
	},
	{
		attribute: 'minDate',
		isValid: (input) => {
			const value = input.value;
			return value
				? new Date(value) >= new Date(input.getAttribute('minDate'))
				: true;
		},
		errorMessage: (input, label) => {
			const date = new Date(input.getAttribute('minDate'));

			const formattedDate = new Intl.DateTimeFormat('ru-RU', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
				.format(date)
				.toString();

			return ` ${label.textContent.slice(
				0,
				4
			)} должна быть не позднее ${formattedDate}`;
		},
	},
	{
		attribute: 'maxDate',
		currentDate: new Date(),
		isValid: function (input) {
			const value = input.value;
			this.currentDate.setHours(5, 0, 0, 0);
			return value ? new Date(input.value) <= this.currentDate : true;
		},
		errorMessage: function (input, label) {
			const formattedDate = new Intl.DateTimeFormat('ru-RU', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
				.format(this.currentDate)
				.toString();

			return `${label.textContent.slice(
				0,
				4
			)} не может быть больше ${formattedDate}`;
		},
	},

	{
		attribute: 'required',
		isValid: (input) => input.value.trim() !== '',
		errorMessage: (input, label) =>
			`Поле "${label.textContent.slice(0, -1)}" обязательно для заполнения`,
	},
];

/**
 * Функция которая проводит валидацию
 * @param {Node} formGroup - Для кастомной валидации, форма разделена на группы.
 * каждая группа содержит 3 элемента:
 * - название поля,
 * - поле для ввода,
 * - контейнер для вывода сообщения об ошибке.
 * @returns {boolean} прошло ли поле валидацию
 */
export const validateSingleFormGroup = (formGroup) => {
	console.log(typeof formGroup, formGroup);
	const label = formGroup.querySelector('label');
	const input = formGroup.querySelector('input,textarea');
	const error = formGroup.querySelector('div');
	let formError = false;
	for (const option of validationOptions) {
		if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
			error.textContent = option.errorMessage(input, label);
			formError = true;
		}
	}
	if (!formError) {
		error.textContent = '';
	}
	return formError;
};

/**
 * Функция-обертка которая находит на форме все элементы(группы формы).
 * и производит их валидацию
 * @param {Node} formToValidate - форма, для которой производится валидация
 * @returns {boolean} все ли поля прошли валидацию?
 */
export const validateForm = (formToValidate) => {
	let isError = false;
	const formGroups = Array.from(
		formToValidate.querySelectorAll('.form__group')
	);

	formGroups.forEach((formGroup) => {
		if (validateSingleFormGroup(formGroup)) {
			isError = true;
		}
	});
	return isError;
};
