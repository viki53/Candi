const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const QUESTIONS = [
	{
		id: 'q1',
		label: 'Test question',
		type: 'radio',
		choices: [
			{
				id: 'q1a1',
				label: '#1'
			},
			{
				id: 'q1a2',
				label: 'Number two'
			},
			{
				id: 'q1a3',
				label: 'Numero tres'
			}
		]
	}
];

const TPL_QUESTION = Handlebars.compile($('#tpl-question').innerHTML);

const TPL_ANSWERS = {
	radio: Handlebars.compile($('#tpl-answer-radio').innerHTML),
	checkbox: Handlebars.compile($('#tpl-answer-checkbox').innerHTML)
};

class QuestionManager {
	constructor(questions) {
		this._currentIndex = -1; // Current question index
		this._questions = questions;

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

		$('#chat-messages').innerHTML = TPL_QUESTION(question);

		if (!TPL_ANSWERS[question.type]) {
			return this.nextQuestion();
		}
		else {
			$('#chat-form').innerHTML = TPL_ANSWERS[question.type](question);
		}
	}
};

document.addEventListener('DOMContentLoaded', function() {
	const MANAGER = new QuestionManager(QUESTIONS);
}, false);
