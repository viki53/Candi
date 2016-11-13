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
		this._currentIndex = -1; // Current question index

		for (let question of questions) {
			console.dir(question);
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
			console.dir(question);
			console.log('----------');
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

		this.userId = localStorage.getItem('userId');

		if (!this.userId) {
			this.userId = firebase.database().ref('/answers').push().key;
			localStorage.setItem('userId', this.userId);
		}

		this.nextQuestion();
	}

	nextQuestion() {
		console.log('nextQuestion');
		if (!this._questions[this._currentIndex + 1]) {
			throw new RangeError('No more questions');
		}

		this._currentIndex++; // Increase current question index

		this.displayCurrentQuestion();
	}

	displayCurrentQuestion() {
		console.log('displayCurrentQuestion');
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

			case 'checkbox':
				this.prepareCheckboxAnswers(question);
			break;
		}
	}

	prepareRadioAnswers(question) {
		Array.prototype.forEach.call($$('#chat-form label'), function (label, i) {
			label.addEventListener('click', (event) => {
				this.answerQuestion(question, question.choices[i]);
			}, false);
		}, this);
	}
	prepareCheckboxAnswers(question) {
		Array.prototype.forEach.call($$('#chat-form label'), function (label, i) {
			label.addEventListener('click', function () {
				console.info('Clicked checkbox', i);
			}, false);
		}, this);
	}

	answerQuestion(question, answer) {
		console.info('Answered question "%s" with "%s"', question.label, answer.label);

		firebase.database().ref('/answers/' + this.userId).update({
			[question.id]: answer.id
		});

		$('#chat-messages').innerHTML += TPL_ANSWERS[question.type](answer);
		return this.nextQuestion();
	}
};
