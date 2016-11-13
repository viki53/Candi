function main ($, $$) {
	var tpl_question = Handlebars.compile($('#tpl-question').innerHTML);

	var tpl_answer_radio = Handlebars.compile($('#tpl-answer-radio').innerHTML);

	var tpl_answer_checkbox = Handlebars.compile($('#tpl-answer-checkbox').innerHTML);

	var question = {
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
	};

	$('#chat-messages').innerHTML = tpl_question(question);
	$('#chat-form').innerHTML = tpl_answer_radio(question);
	$('#chat-form').innerHTML += tpl_answer_checkbox(question);
};

document.addEventListener('DOMContentLoaded', function () {
	main(document.querySelector.bind(document), document.querySelectorAll.bind(document));
}, false);
