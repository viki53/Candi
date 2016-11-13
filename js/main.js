'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const TPL_QUESTION = Handlebars.compile($('#tpl-question').innerHTML);

const TPL_ANSWERS = {
	radio: Handlebars.compile($('#tpl-answer-radio').innerHTML),
	autocomplete: Handlebars.compile($('#tpl-answer-autocomplete').innerHTML),
	checkbox: Handlebars.compile($('#tpl-answer-checkbox').innerHTML)
};

const TPL_FORM_ANSWERS = {
	radio: Handlebars.compile($('#tpl-form-answer-radio').innerHTML),
	autocomplete: Handlebars.compile($('#tpl-form-answer-autocomplete').innerHTML),
	checkbox: Handlebars.compile($('#tpl-form-answer-checkbox').innerHTML)
};

class QuestionManager {
	constructor(questions, translations) {
		this.chat_box = $('#chat-box');
		this.chat_messages = $('#chat-messages');
		this.chat_form = $('#chat-form');
		this.ready = false;
		this._currentIndex = -1; // Current question index

		this._firebaseConfig = {
			apiKey: 'AIzaSyB2C2CuzCLC5yhzMI99Gau3Nx0py5O3v_o',
			authDomain: 'candi-ab7d5.firebaseapp.com',
			databaseURL: 'https://candi-ab7d5.firebaseio.com',
			storageBucket: 'candi-ab7d5.appspot.com',
			messagingSenderId: '594186006245'
		};

		Promise.all([
			this._initFirebase(),
			this._initQuestions(questions, translations)
		])
		.then(() => {
			this.ready = true;
			this.chat_messages.innerHTML = '';

			this.nextQuestion();
		})
		.catch((error) => {
			console.error(error.code, error.message);
		});
	}

	_initFirebase() {
		return new Promise((resolve, reject) => {
			firebase.initializeApp(this._firebaseConfig);

			firebase.auth().onAuthStateChanged((_user) => {
				if (_user && _user.uid) {
					this.userId = _user.uid;

					if (!this.ready) {
						firebase.database().ref('/answers/' + this.userId).once('value', (data) => {
							this._answers = data.val() || {};

							resolve();
						});
					}
				}
				else {
					firebase.auth().signInAnonymously()
					.catch(reject);
				}
			});
		})
	}

	_initQuestions(questions, translations) {
		for (let question of questions) {
			for (let question_trad of translations.questions) {
				if (question_trad.id === question.id) {
					question.label = question_trad.label;

					if (question.choices) {
						for (let choice of question.choices) {
							for (let choice_trad of question_trad.choices) {
								if (choice_trad.id === choice.id) {
									choice.label = choice_trad.label;
								}
							}
						}
					}
				}
			}
		}
		this._questions = questions;
	}

	scrollToBottom() {
		this.chat_messages.scrollTop = this.chat_messages.scrollHeight;
	}

	nextQuestion() {
		if (!this._questions[this._currentIndex + 1]) {
			throw new RangeError('No next question');
		}

		this._currentIndex++;

		this.displayCurrentQuestion();
	}
	previousQuestion() {
		if (!this._questions[this._currentIndex - 1]) {
			throw new RangeError('No previous question');
		}

		this._currentIndex--;

		this.displayCurrentQuestion();
	}

	displayCurrentQuestion() {
		let question = this._questions[this._currentIndex];

		this.chat_messages.innerHTML += TPL_QUESTION(question);

		if (!TPL_FORM_ANSWERS[question.type]) {
			this.scrollToBottom();
			return this.nextQuestion();
		}
		else {
			this.chat_form.innerHTML = TPL_FORM_ANSWERS[question.type](question);
		}

		switch (question.type) {
			case 'radio':
				this.prepareRadioAnswers(question);
			break;

			case 'autocomplete':
				this.prepareAutocompleteAnswers(question);
			break;

			case 'checkbox':
				this.prepareCheckboxAnswers(question);
			break;
		}

		this.scrollToBottom();
	}

	prepareRadioAnswers(question) {
		Array.prototype.forEach.call($$('#chat-form label'), (label, i) => {
			let input = label.parentNode.querySelector('input[type="radio"]');

			if (question.choices[i].id === this._answers[question.id]) {
				input.focus();
			}

			label.addEventListener('click', (event) => {
				event.preventDefault();
				this.answerQuestion(question, question.choices[i]);
			}, false);
			input.addEventListener('keypress', (event) => {
				event.preventDefault();
				if (event.key == 'Enter') {
					this.answerQuestion(question, question.choices[i]);
				}
			}, false);
		});
	}
	prepareAutocompleteAnswers(question) {
		let input = this.chat_form.querySelector('input[type="text"]');

		let answerAutocomplete = (event) => {
			event.preventDefault();
			let value = input.value;

			for (let choice of question.choices) {
				if (choice.label === value) {
					this.answerQuestion(question, choice);
					this.chat_form.removeEventListener('submit', answerAutocomplete);
				}
			}
		};

		input.focus();

		if (this._answers[question.id]) {
			for (var choice of question.choices) {
				if (choice.id === this._answers[question.id]) {
					$('#chat-form input[type="text"]').value = choice.label;
				}
			}
		}
		this.chat_form.addEventListener('submit', answerAutocomplete, false);
	}
	prepareCheckboxAnswers(question) {
		let answers = [];

		let previousAnswer = this._answers[question.id] || [];

		let updateCheckboxCount = () => {
			$('#form-answer-checkbox-count').textContent = answers.length + '/' + question.choices.length;
		}
		let answerCheckbox = (event) => {
			this.answerQuestion(question, answers);
			this.chat_form.removeEventListener('submit', answerCheckbox);
		};

		console.dir(TPL_ANSWERS.checkbox);

		Array.prototype.forEach.call($$('#chat-form label'), (label, i) => {
			let answer = question.choices[i];

			let input = label.parentNode.querySelector('input[type="checkbox"]');

			let index = previousAnswer.indexOf(answer.id);
			if (index !== -1) {
				input.checked = true;
				answers.push(answer);
			}

			input.addEventListener('change', (event) => {
				let index = answers.indexOf(answer);

				if (!input.checked && index !== -1) {
					answers.splice(index, 1);
				}
				else if (input.checked) {
					answers.push(answer);
				}

				updateCheckboxCount();
			}, false);
		});

		updateCheckboxCount();

		this.chat_form.addEventListener('submit', answerCheckbox, false);
	}

	answerQuestion(question, answer) {
		if (Array.isArray(answer)) {
			let ids = [];
			let labels = [];

			for (let ans of answer) {
				ids.push(ans.id);
				labels.push(ans.label);
			}

			firebase.database().ref('/answers/' + this.userId).update({
				[question.id]: ids
			});

			this._answers[question.id] = ids;

			this.chat_messages.innerHTML += TPL_ANSWERS[question.type]({
				answers: answer
			});
		}
		else {
			firebase.database().ref('/answers/' + this.userId).update({
				[question.id]: answer.id
			});

			this._answers[question.id] = answer.id;

			this.chat_messages.innerHTML += TPL_ANSWERS[question.type](answer);
		}

		this.chat_form.innerHTML = '';
		this.scrollToBottom();

		this.nextQuestion();
	}
};
