const { firebase } = require("./firebase_config");
async function signout() {
  try {
    await firebase.auth().signOut();
  } catch (error) {
    throw error;
  }
}

async function email_Signin(email, password) {
  try {
    let res = await firebase.auth().signInWithEmailAndPassword(email, password);
    return { user: res.user };
  } catch (error) {
    throw error;
  }
}

async function email_Signup(email, password) {
  try {
    let res = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    return { user: res.user };
  } catch (error) {
    throw error;
  }
}

async function guest_Signin() {
  try {
    let res = await firebase.auth().signInAnonymously();
    return { user: res.user };
  } catch (error) {
    throw error;
  }
}

async function google_Signin() {
  try {
    let provider = new firebase.auth.GoogleAuthProvider();
    let res = await firebase.auth().signInWithPopup(provider);
    return { user: res.user, token: res.credential.accessToken };
  } catch (error) {
    throw error;
  }
}

async function anonymous_To_Google() {
  try {
    if (c_user().isAnonymous) {
      const res = await firebase
        .auth()
        .currentUser.linkWithPopup(new firebase.auth.GoogleAuthProvider());
      return res;
    } else throw new Error("Not an anonymous user");
  } catch (error) {
    alert(error);
    throw error;
  }
}

async function anonymous_To_Email(email, password) {
  try {
    if (firebase.auth().currentUser.isAnonymous) {
      let credentials = firebase.auth.EmailAuthProvider.credential(
        email,
        password
      );
      let res = await firebase
        .auth()
        .currentUser.linkWithCredential(credentials);
      return { user: res.user };
    } else throw new error("Not an anoynymous user");
  } catch (error) {
    throw error;
  }
}

async function send_Verification_Email() {
  try {
    let actionCodeSetting = {
      url: "https://rvs54.csb.app/",
    };
    await firebase.auth().currentUser.sendEmailVerification(actionCodeSetting);
  } catch (error) {
    throw error;
  }
}

async function update_Password(password, newPassword) {
  try {
    let credentials = firebase.auth.EmailAuthProvider.credential(
      firebase.auth().currentUser.email,
      password
    );
    await firebase.auth().currentUser.reauthenticateWithCredential(credentials);
    await firebase.auth().currentUser.updatePassword(newPassword);
  } catch (error) {
    throw error;
  }
}

function is_Email_Verified() {
  return firebase.auth().currentUser.emailVerified;
}

function is_User_Anonymous() {
  return firebase.auth().currentUser.isAnonymous;
}

function is_Signedin() {
  if (firebase.auth().currentUser) return true;
  return false;
}

function get_Current_User() {
  return firebase.auth().currentUser;
}

function listen_auth_change(callback) {
  return firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      callback(user);
    } else {
      callback(null);
    }
  });
}

async function send_Password_Reset_Email(email, redirectUrl) {
  const actionCodeSetting = {
    url: redirectUrl,
  };
  if (!firebase.auth().currentUser)
    try {
      await firebase.auth().sendPasswordResetEmail(email, actionCodeSetting);
    } catch (error) {
      throw error;
    }
}

async function confirm_Password_Reset(code, newPassword) {
  try {
    await firebase.auth().confirmPasswordReset(code, newPassword);
  } catch (error) {
    throw error;
  }
}

async function verify_Email(code) {
  try {
    await firebase.auth().applyActionCode(code);
  } catch (error) {
    throw error;
  }
}

const Auth = {
  listen_auth_change,
  signout,
  email_Signin,
  email_Signup,
  anonymous_To_Email,
  anonymous_To_Google,
  confirm_Password_Reset,
  send_Password_Reset_Email,
  get_Current_User,
  is_Email_Verified,
  is_Signedin,
  is_User_Anonymous,
  get_Current_User,
  send_Password_Reset_Email,
  google_Signin,
  guest_Signin,
  update_Password,
  send_Verification_Email,
  verify_Email,
};

// export default Auth;
// token =
//   "  eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU4NzIyNjc3OCwiZXhwIjoxNTg3MjMwMzc4LCJpc3MiOiJ2aXNpb24tYXJ0LWdhbGxlcnlAYXBwc3BvdC5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoidmlzaW9uLWFydC1nYWxsZXJ5QGFwcHNwb3QuZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6Im1hc3RlciJ9.Tr4jsp-u6wAMwfA5kaEftjbf12mjNOwVFQO9NHmvITCGm3qwrAqRD7KtYuO7BasvwNh5FCMtnTgOQjdSNVWTOkc1sdloeptpEKJuEZJwifJbQWCsN9jgZ6BBkldtt4A7cdRVVUl9uwXsY59BfTaRclgrsHU79FqwnxKrS2lAu4_XR_JTVCJnpAROq7ogJSpToBLpga6eZamyqafMXq0uuSFE6VTAPddK9VVLINNCHhxUJsSpgc0v0UCmZBJEOEXSau6tDFbQMB4QxE5RFyeb49PE3ymyIW3BGS1SCDCbscU7AIJ3Sozro83_cYMYUnZHNyWgP_8MZ_WUoLgffBaCiQ";

// firebase
//   .auth()
//   .signInWithCustomToken(token)
//   .then((res) => console.log("signed in successfully"))
//   .catch((e) => console.log(e));

/*
1. require to import *
2. naming convention (with namespace or without namespace) *
3. cofig ---> firebase_config*
4. always import firebase resources from firebase_config file insteasd of importing directly from firebase libraray*
5. change all hardcoded refs to imported refs*
6. refactor backend code too *
7. add same firebase_config as well as protos to backend code*
8. read about auth custom claims and RBAC *
IMP imperitive and declarative programming *
*/

/*
minor actionable task -> add to cart / add to wishlist /...
major actionable task -> place order /...

User Auth Flow
  minor actionable task
    if not signed in
      show prompt for (sign in | email sign up | guest sign in) then continue task
    else
      just continue the task


  major actionable task
    if guest signed in
      show prompt for (google sign in | email sign up | email sign in* (prompt that current data will get lost))
    else if emal signed in but email !== verified
      show prompt to (resend email verification link) then after email verification continu the task (through deep linking)
*/
