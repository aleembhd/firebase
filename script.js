import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import firebaseConfig from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const googleSignInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const loginSection = document.getElementById('loginSection');
const signUpSection = document.getElementById('signUpSection');
const formSection = document.getElementById('formSection');
const showSignUpLink = document.getElementById('showSignUp');
const showSignInLink = document.getElementById('showSignIn');
const emailPasswordForm = document.getElementById('emailPasswordForm');
const signUpForm = document.getElementById('signUpForm');

googleSignInButton.addEventListener('click', signInWithGoogle);
signOutButton.addEventListener('click', signOutUser);
showSignUpLink.addEventListener('click', showSignUp);
showSignInLink.addEventListener('click', showSignIn);
emailPasswordForm.addEventListener('submit', signInWithEmailPassword);
signUpForm.addEventListener('submit', signUpWithEmailPassword);

function signInWithGoogle() {
    console.log("Attempting to sign in with Google");
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Google Sign-In successful:", result.user);
            showForm();
        }).catch((error) => {
            console.error("Google Sign-In error:", error.code, error.message);
            alert("Error signing in with Google: " + error.message);
        });
}

function signInWithEmailPassword(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log("Attempting to sign in with email:", email);
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User signed in successfully:", userCredential.user);
            showForm();
        })
        .catch((error) => {
            console.error("Error signing in:", error.code, error.message);
            alert("Error signing in: " + error.message);
        });
}

function signUpWithEmailPassword(e) {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User signed up:", userCredential.user);
            showForm();
        })
        .catch((error) => {
            console.error("Error signing up:", error);
            alert("Error signing up: " + error.message);
        });
}

function showSignUp(e) {
    e.preventDefault();
    loginSection.style.display = 'none';
    signUpSection.style.display = 'block';
}

function showSignIn(e) {
    e.preventDefault();
    loginSection.style.display = 'block';
    signUpSection.style.display = 'none';
}

function signOutUser() {
    signOut(auth).then(() => {
        console.log("User signed out");
        hideForm();
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

function showForm() {
    console.log("Showing form");
    loginSection.style.display = 'none';
    signUpSection.style.display = 'none';
    formSection.style.display = 'block';
}

function hideForm() {
    console.log("Hiding form");
    loginSection.style.display = 'block';
    signUpSection.style.display = 'none';
    formSection.style.display = 'none';
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user);
        showForm();
    } else {
        console.log("No user is signed in");
        hideForm();
    }
});

document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const rollNumber = document.getElementById('rollNumber').value;
    const college = document.getElementById('college').value;

    const user = auth.currentUser;
    if (!user) {
        console.error("User not signed in");
        return;
    }

    const studentsRef = ref(database, 'students');
    push(studentsRef, {
        name: name,
        rollNumber: rollNumber,
        college: college,
        userId: user.uid
    })
    .then(() => {
        console.log("Data saved successfully");
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = `Saved! Name: ${name}, Roll Number: ${rollNumber}, College: ${college}`;
        messageDiv.style.color = "green";
        document.getElementById('studentForm').reset();
    })
    .catch((error) => {
        console.error("Error saving data: ", error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = "Error saving data. Please try again.";
        messageDiv.style.color = "red";
    });
});

const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', searchStudent);

function searchStudent() {
    console.log("Search function called");
    const rollNumberToSearch = document.getElementById('searchRollNumber').value.trim();
    console.log("Searching for roll number:", rollNumberToSearch);
    
    if (!rollNumberToSearch) {
        document.getElementById('searchResult').textContent = "Please enter a roll number to search.";
        return;
    }

    const studentsRef = ref(database, 'students');
    const searchQuery = query(studentsRef, orderByChild('rollNumber'), equalTo(rollNumberToSearch));

    console.log("Executing search query...");
    get(searchQuery)
        .then((snapshot) => {
            console.log("Search query completed");
            console.log("Snapshot exists:", snapshot.exists());
            console.log("Snapshot value:", snapshot.val());
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const studentData = childSnapshot.val();
                    console.log("Found student data:", studentData);
                    document.getElementById('searchResult').innerHTML = `
                        <h3>Student Found:</h3>
                        <p>Name: ${studentData.name}</p>
                        <p>Roll Number: ${studentData.rollNumber}</p>
                        <p>College: ${studentData.college}</p>
                    `;
                });
            } else {
                console.log("No student found");
                document.getElementById('searchResult').textContent = "No student found with this roll number.";
            }
        })
        .catch((error) => {
            console.error("Error searching for student:", error);
            console.error("Error details:", error.message, error.code, error.stack);
            document.getElementById('searchResult').textContent = "An error occurred while searching. Please try again.";
        });
}

console.log("Firebase initialized with config:", firebaseConfig);