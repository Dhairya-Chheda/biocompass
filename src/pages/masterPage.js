import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import * as constants from 'public/constants.js'; // Adjust the path to your constants file if necessary
import wixData from 'wix-data';
import wixMembers from 'wix-members';
import wixLocationFrontend from 'wix-location-frontend';

// Function to check profile completeness and redirect
function checkProfile(databaseName, profileUrl, profileCompleteField) {
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
                }
                return databaseName
            }
        })
        .catch((error) => {
            console.error(`Error checking profile for ${databaseName}:`, error);
        });
}

$w.onReady(function () {
    // Check if the user is logged in
    wixMembers.authentication.onLogin(() => {
        checkProfile(constants.BUSINESS_DATABASE, constants.BUSINESS_PROFILE_URL, "profileComplete");
        checkProfile(constants.USER_DATABASE, constants.USER_DASHBOARD_URL, "profileComplete");
    })

    wixMembers.authentication.onLogout(() => {
        wixLocationFrontend.to(constants.REGISTER)
    })

    $w('#headerProfileIcon').onClick(() => {
        if (wixUsers.currentUser.loggedIn) {
            wixMembers.currentMember.getRoles()
                .then((roles) => {
                    let user = checkTitle(roles, 'User')
                    let business = checkTitle(roles, 'Business')

                    console.log("user", user);

                    if(user){
                        wixLocation.to(constants.USER_DASHBOARD_URL)
                    }
                    if(business){
                        wixLocation.to(constants.BUSINESS_DASHBOARD_URL)
                    }

                    return roles;
                })
                .catch((error) => {
                    console.error(error);
                });

        } else {
            wixLocation.to('/login?userType=user')
        }
    })

});

function checkTitle(rolesArray, searchString) {
  for (let i = 0; i < rolesArray.length; i++) {
    if (rolesArray[i].title === searchString) {
      return searchString;
    }
  }
  return false; // Return false if the title is not found
}

/* Returned roles array:
 * [
 *   {
 *     "_id": "42082477-9616-4f15-bf1d-64b2b3049a42",
 *     "_createdDate": "2021-01-31T23:26:56.089Z",
 *     "title": "Forum Gatekeeper",
 *     "description": "Can approve or block members, close discussions, and delete posts",
 *     "color": "LIGHT_GREEN"
 *   },
 *   {
 *     "_id": "9c3501b4-b8e0-4970-8795-d8ecfea698b7",
 *     "_createdDate": "2021-01-31T23:26:17.535Z",
 *     "title": "Forum Mod",
 *     "description": "Can approve posts from new members and lock discussions",
 *     "color": "VIOLET"
 *   },
 *   {
 *     "_id": "00000000-0000-0000-0000-000000000001",
 *     "title": "Admin",
 *     "color": "DARK_BLUE"
 *   }
 * ]
 */