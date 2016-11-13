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
		this.ready = false;
		this._currentIndex = -1; // Current question index

		for (let question of questions) {
			for (let question_trad of translations.questions) {
				if (question_trad.id === question.id) {
					question.label = question_trad.label;

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
		this._questions = questions;

		this._firebaseConfig = {
			apiKey: 'AIzaSyB2C2CuzCLC5yhzMI99Gau3Nx0py5O3v_o',
			authDomain: 'candi-ab7d5.firebaseapp.com',
			databaseURL: 'https://candi-ab7d5.firebaseio.com',
			storageBucket: 'candi-ab7d5.appspot.com',
			messagingSenderId: '594186006245'
		};

		firebase.initializeApp(this._firebaseConfig);

		firebase.auth().onAuthStateChanged((_user) => {
			if (_user && _user.uid) {
				this.userId = _user.uid;

				if (!this.ready) {
					this.ready = true;
					firebase.database().ref('/answers/' + this.userId).once('value', (data) => {
						this._answers = data.val() || {};

						this.nextQuestion();
					});
				}
			}
			else {
				firebase.auth().signInAnonymously()
				.catch((error) => {
					console.error(error.code, error.message);
				});
				return;
			}
		});
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

		$('#chat-messages').innerHTML += TPL_QUESTION(question);

		if (!TPL_FORM_ANSWERS[question.type]) {
			return this.nextQuestion();
		}
		else {
			$('#chat-form').innerHTML = TPL_FORM_ANSWERS[question.type](question);
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
	}

	prepareRadioAnswers(question) {
		Array.prototype.forEach.call($$('#chat-form label'), function (label, i) {
			if (question.choices[i].id === this._answers[question.id]) {
				label.classList.add('highlight');
			}
			label.addEventListener('click', (event) => {
				event.preventDefault();
				this.answerQuestion(question, question.choices[i]);
			}, false);
		}, this);
	}
	prepareAutocompleteAnswers(question) {
		let answerAutocomplete = (event) => {
			event.preventDefault();
			let input = $('#chat-form input[type="text"]').value;

			for (let choice of question.choices) {
				if (choice.label === input) {
					this.answerQuestion(question, choice);
					$('#chat-form').removeEventListener('submit', answerAutocomplete);
				}
			}
		};

		if (this._answers[question.id]) {
			for (var choice of question.choices) {
				if (choice.id === this._answers[question.id]) {
					$('#chat-form input[type="text"]').value = choice.label;
				}
			}
		}
		$('#chat-form').addEventListener('submit', answerAutocomplete, false);
	}
	prepareCheckboxAnswers(question) {
		Array.prototype.forEach.call($$('#chat-form label'), function (label, i) {
			label.addEventListener('click', (event) => {
				event.preventDefault();
			}, false);
		}, this);
	}

	answerQuestion(question, answer) {
		firebase.database().ref('/answers/' + this.userId).update({
			[question.id]: answer.id
		});

		this._answers[question.id] = question.lastAnswer = answer.id;

		$('#chat-messages').innerHTML += TPL_ANSWERS[question.type](answer);
		return this.nextQuestion();
	}
};
