// Initialize Firebase
var config = {
	apiKey: 'AIzaSyB2C2CuzCLC5yhzMI99Gau3Nx0py5O3v_o',
	authDomain: 'candi-ab7d5.firebaseapp.com',
	databaseURL: 'https://candi-ab7d5.firebaseio.com',
	storageBucket: 'candi-ab7d5.appspot.com',
	messagingSenderId: '594186006245'
};

firebase.initializeApp(config);

var user = window.localStorage.getItem("userid")

var answers = document.querySelectorAll('.answers li')

for (var i = 0; i < answers.length; i++) {
	answers[i].addEventListener('click', onanswer)
}

function onanswer(event) {
	var answer = {}
	answer[this.dataset.questionid] = this.dataset.choiceid

	if (!user) {
		user = firebase.database().ref('/answers').push().key
		window.localStorage.setItem("userid", user)
	}

	firebase.database().ref('/answers/' + user).update(answer)	
}