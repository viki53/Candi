const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const QUESTIONS = [
	{
		id: 'q1',
		label: 'Are you religious?',
		type: 'radio',
		choices: [
			{
				id: 'q1a1',
				label: 'Yes'
			},
			{
				id: 'q1a2',
				label: 'No'
			}
		]
	},
	{
		id: 'q2',
		label: 'What do you believe in?',
		type: 'checkbox',
		choices: [
			{
				id: 'q2a1',
				label: 'Nothing'
			},
			{
				id: 'q2a2',
				label: 'God'
			},
			{
				id: 'q2a3',
				label: 'Allah'
			},
			{
				id: 'q2a4',
				label: 'Mother Nature'
			},
			{
				id: 'q2a5',
				label: 'Satan'
			},
			{
				id: 'q2a6',
				label: 'Ganesh'
			},
			{
				id: 'q2a7',
				label: 'Pasta'
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

		$('#chat-messages').innerHTML += TPL_QUESTION(question);

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
