import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { authentication, currentMember } from "wix-members-frontend";
import { assignRoleToMember } from 'backend/role-assigner';
import { session } from "wix-storage";
// import { getAuthUrl } from "backend/OAuth";
import * as constants from 'public/constants'
import { getAuthUrl } from "@velo/google-sso-integration";

var userType = constants.USER;
const loadingSignUp = '#loaderSignUp'
const loadingLogIn = '#loaderLogin'
var loginType = 'login'

// USER REGISTRATION: biocompass.io/register?userType=user
// BUSINESS REGISTRATION: biocompass.io/register?userType=business


$w.onReady(function () {
    console.log("Version 7.2");

    if(wixUsers.currentUser.loggedIn){
        checkProfile(constants.BUSINESS_DATABASE, constants.BUSINESS_PROFILE_URL, "profileComplete", constants.BUSINESS_DASHBOARD_URL);
        checkProfile(constants.USER_DATABASE, constants.USER_DASHBOARD_URL, "profileComplete", constants.USER_DASHBOARD_URL);
        return
    }else{
        console.log("User not logged in");
    }
    console.log(userType);
    console.log("constants.USER", constants.USER);

  const urlParams = new URLSearchParams(wixLocation.query);
  const sessionToken = urlParams.get('sessionToken');
  userType = urlParams.get('userType')
  loginType = urlParams.get('loginType')

  if(userType) setUserType(userType)
  else setUserType(constants.USER)

  if(loginType) setLoginType(loginType)
  else setLoginType('logIn')
//   if(userType === 'user'){
      
//   }
//   console.log(urlParams.get('query'));
//   console.log(sessionToken);


  if (sessionToken) {
    authentication.applySessionToken(sessionToken)
      .then(() => {
        console.log('User logged in successfully');
        // Redirect to a logged-in page or perform further actions
        wixLocation.to(constants.USER_DASHBOARD_URL);
      })
      .catch((error) => {
        console.error('Failed to apply session token', error);
      });
  }else{
      console.log("There is no session token");
  }


    // ######### On Clicks Initialisation ##########
    $w("#goToLoginUser").onClick(() => {
        $w('#multiStateBox1').changeState("logIn")
        setLoginType('logIn')    
    });
    $w("#goToCreateAccount").onClick(() => {
        $w('#multiStateBox1').changeState("signUp")
        setLoginType('signUp')
    })
    $w("#existingAccountUser").onClick(() => {
        $w('#multiStateBox1').changeState("logIn")
        setLoginType('logIn')    
    })
    $w('#createNewAccount').onClick(() => {
        $w('#multiStateBox1').changeState("signUp")
        setLoginType('signUp')
    })

    $w('#signUpUser').onClick(() => {setUserType(constants.USER)})
    $w('#signUpBusiness').onClick(() => {setUserType(constants.BUSINESS)})

    $w('#forgotPassword').onClick(() => {
        authentication.promptForgotPassword()
    })

    // Member Login
    const loginMember = async () => {
        const email = $w("#emailIdInputLogin").value;
        const password = $w("#passwordInputLogin").value;

        hideMessages();
        showLoading(loadingLogIn);

        try {
            const memberIsLoggedIn = await authentication.login(email, password);
            console.log(memberIsLoggedIn);
            currentMember.getRoles().then((roles) => {
                if(roles[0]._id === constants.USER_ROLE){
                    wixLocation.to(constants.USER_DASHBOARD_URL);
                }else if(roles[0]._id === constants.BUSINESS_ROLE){
                    wixLocation.to(constants.BUSINESS_DASHBOARD_URL)
                }else{
                    console.log("This should never happen. User should have one of the 2 roles");
                }
            })
            $w("#successMessageLogin").text = "Login Successful! Redirecting...";
            $w("#successMessageLogin").show();
            
        } catch (error) {
            console.log(error);
            $w("#errorMessageLogin").text = "There was an error logging in. Please check your credentials";
            $w("#errorMessageLogin").show();
        } finally {
            hideLoading(loadingLogIn);
        }
    };

    $w("#logInButton").onClick(loginMember);

    //Sign-up
    $w("#signUpButton").onClick(async () => {
        console.log("signUPUserType ", userType);
        const email = $w("#emailIdSignUp").value;
        const password = $w("#passwordSignUp").value;

        hideMessages();
        showLoading(loadingSignUp);

        if ($w('#emailIdSignUp').valid && $w('#passwordSignUp').valid) {
            //Do nothing
        }else{
            showMessage("#errorMessageSignUp", "Please enter a valid email and password.");
            return;
        }

        console.log(`Attempting to register user with email: ${email}`);
        try {
            const result = await wixUsers.register(email, password);
            console.log('Registration result:', result);
            if (!result || !result.user) {
                throw new Error("User registration failed. Result or result.user is undefined.");
            }

            const userId = result.user.id;
            console.log(`User registered successfully with ID: ${userId}`);

            const newUser = {
                "_id": userId,
                "email": email
            };
            if(userType === constants.USER){
                await wixData.insert(constants.USER_DATABASE, newUser);
                showMessage("#successMessageSignUp", "User registered successfully!");

                const roleAssignResult = await assignRoleToMember(userId, constants.USER_ROLE);
                if (roleAssignResult.success) {
                    console.log("Role assigned successfully.");
                    setTimeout(() => {
                        wixLocation.to('https://www.biocompass.io' + constants.USER_DASHBOARD_URL);
                    }, 1500);
                } else {
                    console.error("Role assignment failed:", roleAssignResult.error);
                    console.log("This should not happen");
                }
                
            } else if(userType === constants.BUSINESS){
                await wixData.insert(constants.BUSINESS_DATABASE, newUser);
                showMessage("#successMessageSignUp", "User registered successfully!");

                const roleAssignResult = await assignRoleToMember(userId, constants.BUSINESS_ROLE);
                if (roleAssignResult.success) {
                    console.log("Role assigned successfully.");
                    setTimeout(() => {
                        wixLocation.to('https://www.biocompass.io' + constants.BUSINESS_PROFILE_URL);
                    }, 1500);
                } else {
                    console.error("Role assignment failed:", roleAssignResult.error);
                }
                
            }else{
                console.log("This should never happen, there is some error, please check code");
            }
            
        } catch (err) {
            console.error('Error registering user:', err);
            showMessage("#errorMessageSignUp", `Error registering user: ${err}`);
        } finally {
            hideLoading(loadingSignUp);
        }
    });

    $w("#logInWithGoogle").onClick(() => {
  // Prevent double click on button
        $w("#logInWithGoogle").disable();

        getAuthUrl()
            .then((url) => {
            // Redirect to google login
            wixLocation.to(url);
            })
            .catch((error) => {
            console.log(error);
            });
    });
    $w("#signUpWithGoogle").onClick(() => {
        $w("#signUpWithGoogle").disable();
        console.log("clicked-signup-google")
        getAuthUrl()
        .then((url) => {
            wixLocation.to(url);
        })
        .catch((error) => {
            console.log(error);
        })
    });
});

function showMessage(elementId, message) {
    $w(elementId).text = message;
    $w(elementId).show();
    $w(loadingLogIn).hide()
    $w(loadingSignUp).hide()
}

function hideMessages() {
    $w("#errorMessageSignUp").hide();
    $w("#successMessageSignUp").hide();
    $w("#errorMessageLogin").hide();
    $w("#successMessageLogin").hide();
}

function showLoading(loadingGifId) {
    $w(loadingGifId).show();
}

function hideLoading(loadingGifId) {
    $w(loadingGifId).hide();
}

function setUserType(ut){
    if(ut === constants.USER){
        $w('#signUpUser').style.backgroundColor = '#ffffff'
        $w('#signUpBusiness').style.backgroundColor = '#EEF0F3'
        userType = constants.USER
        session.setItem('userType', constants.USER)
    }else if(ut === constants.BUSINESS){
        $w('#signUpBusiness').style.backgroundColor = '#ffffff'
        $w('#signUpUser').style.backgroundColor = '#EEF0F3'
        userType = constants.BUSINESS
        session.setItem('userType', constants.BUSINESS)
    }else{
        console.log("Error in setting user type");
    }
    console.log("User type after setting user", userType);
}


function setLoginType(lt) {
    if(lt === 'signUp'){
        $w('#multiStateBox1').changeState('signUp')
        session.setItem('loginType', 'signUp')
    }else{
        $w('#multiStateBox1').changeState('logIn')
        session.setItem('loginType', 'logIn')
    }
}

function checkProfile(databaseName, profileUrl, profileCompleteField, dashboardUrl) {
    const userId = wixUsers.currentUser.id;

    wixData.query(databaseName)
        .eq("_id", userId)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                const user = results.items[0];
                console.log(`Current user type: ${databaseName}`);
                if (!user[profileCompleteField]) {
                    // Redirect to the appropriate profile page if profile is not complete
                    wixLocation.to(profileUrl);
                }else{
                    wixLocation.to(dashboardUrl)
                }
            }
        })
        .catch((error) => {
            console.error(`Error checking profile for ${databaseName}:`, error);
        });
}