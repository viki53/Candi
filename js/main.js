function main ($, $$) {
	var source = $('#tpl-question').innerHTML;
	var template = Handlebars.compile(source);

	var question = {
		label: 'Test question',
		type: 'radio',
		choices: [
			{
				label: '#1'
			},
			{
				label: 'Number two'
			},
			{
				label: 'Numero tres'
			}
		]
	};

	var html = template(question);
	console.log(source);
	// console.log(template);
	// console.log(html);
	$('#chat-messages').innerHTML = html;
};

document.addEventListener('DOMContentLoaded', function () {
	main(document.querySelector.bind(document), document.querySelectorAll.bind(document));
}, false);
