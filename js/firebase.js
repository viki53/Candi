// Initialize Firebase
var config = {
	apiKey: 'AIzaSyB2C2CuzCLC5yhzMI99Gau3Nx0py5O3v_o',
	authDomain: 'candi-ab7d5.firebaseapp.com',
	databaseURL: 'https://candi-ab7d5.firebaseio.com',
	storageBucket: 'candi-ab7d5.appspot.com',
	messagingSenderId: '594186006245'
};

firebase.initializeApp(config);

var user;
firebase.auth().onAuthStateChanged(function(_user) {
	if (_user) {
		user = _user.uid
	} else {
		firebase.auth().signInAnonymously().catch(function(error) {
			console.error(error.code, error.message)
		})
	}
})

firebase.database().ref('/answers/' + user).once('value', function(datasnapshot){
	var answers = datasnapshot.val()
})

var answers = document.querySelectorAll('.answers li')

for (var i = 0; i < answers.length; i++) {
	answers[i].addEventListener('click', onanswer)
}

function onanswer(event) {
	var answer = {}
	answer[this.dataset.questionid] = this.dataset.choiceid

	firebase.database().ref('/answers/' + user).update(answer)	
}