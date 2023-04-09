## Проект "Блок с комментариями"
##### Демо-версия (netlify): [block-of-comments](https://block-of-comments.netlify.app/)
Для генерации тестовых данных используется библиотека faker
https://fakerjs.dev/

###### !Если курсор находится в поле "комментарий", то, при нажатии на клавишу enter, происходит переход на новую строку, а не отправка формы!

Валидация формы имеет две составлющие:

- валидация в html,
- валидация с использованием javaScript.

Для того, чтобы между ними не возникало конфликтов, аттрибуты,
управляющие валидацией в html, заданы с запасом. Таким образом, сначала работает валидация в
javaScript и только потом валидация в html.

##### Пример:

```javascript
<input
	class="form__text-input"
	type="text"
	id="name"
	name="name"
	minlength="2"
	maxlength="30"
	// кастомный атрибут для JS валидации
	custommaxlength="12"
	required
	placeholder="Введите имя"
/>
```

Между сессиями данные хранятся в localStore. Если localStore пуст, или все комментарии удалены, можно, на выбор, или загрузить тестовые данные, или добавить комментарии с помощью формы
