import { getAuth } from '@velo/google-sso-integration-backend';

export function get_getAuth(request) {
    return getAuth(request)
      .catch((error) => {
          console.log(error);
      });
}
//Commented Code
// // backend/http-functions.js
// import { encryption } from 'backend/crypto';
// import {ok, notFound, serverError , created, response } from 'wix-http-functions';
// import wixData from 'wix-data';
// import { google } from 'googleapis';
// import { authentication } from 'wix-members-backend';
// import { getSecret } from 'wix-secrets-backend';
// import { fetch } from 'wix-fetch';
// import { DOMAIN_URL } from 'public/constants';

// // Implement session state retrieval if needed
// function getSessionState(requestState) {
//   // Logic to retrieve session state based on requestState
//   // This could be a database lookup or in-memory cache, etc.
//   return requestState; // Placeholder
// }


// export async function get_getAuth(request) {

//   // retrieve the client secret from the Secrets Manager
// //  const googleClientSecret = await getSecret('clientSecret');
//  const googleConfig = {
//   clientId: '832528844566-bs5u319op7m4fff3ogoj8pt9ecd0mm8l.apps.googleusercontent.com',
//   clientSecret: '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',
//   redirect: `${DOMAIN_URL}/_functions/getAuth`
//  };

//  //get the autorization code and state variable form the request URL
//  const code = await request.query.code
//  const state= await request.query.state

//  // create a connection to google's authentication services
//  const auth2 = new google.auth.OAuth2(
//   googleConfig.clientId,
//   googleConfig.clientSecret,
//   googleConfig.redirect
//  );

//  //get the access token from the request with the authorization code we got from google 
//  const data = await auth2.getToken(code);
//  const tokens = data.tokens;

// // console.log(tokens)
//  //get the user info using the access token
//  const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${tokens.access_token}`, { "method": "get" })

//  if (!userInfoRes.ok) {
//   console.log("could not get user info using access token")
//  }

//  //extract the user's email and profile picture URL
//  const userInfo = (await userInfoRes.json())
//  console.log("UserInfo",userInfo)
//  const userEmail = userInfo.email
//  const profilePicture = userInfo.picture

//  let access_token = await encryption(tokens.access_token);
//  let refresh_token = await encryption(tokens.refresh_token);

//  wixData.query('AccessTokens')
//   .eq('email', userEmail)
//   .find()
//   .then((results) => {
//     if (results.items.length > 0) {
//       // An item with the userEmail exists, update it
//       let item = results.items[0]; // get the first item
//       item.accessToken = access_token; // replace with your new access tokens
//       item.refreshToken =refresh_token; // replace with your new refresh tokens
  
//       wixData.update('AccessTokens', item)
//         .then((updatedItem) => {
//           console.log('Updated')
//         })
//         .catch((err) => {
//           console.log(err)
//         });
//     } else {
//       // No item with the userEmail exists, insert a new one
//       let item = {
//         email: userEmail,
//         accessToken: access_token, // replace with your new access tokens
//         refreshToken: refresh_token // replace with your new refresh tokens
//       };
  
//       wixData.insert('AccessTokens', item)
//         .then((insertedItem) => {
//           console.log('Inserted')
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//   });

//  //now that we have the email we can use it to generate a Wix session token to use in the frontend
//  const sessionToken = await authentication.generateSessionToken(userEmail);

//  //return the url, session token, state variable, and profile picture to google to rediect the browser to our logged in page.
//  return response({
//   status: 302,
//   headers: { 'Location': `${DOMAIN_URL}/dashboard?sessiontoken=${sessionToken}&responseState=${state}&email=${userEmail}` }
//  });
// }

// export async function get_getAccessTokens(request){
//   let options = {
//     "headers": {
//       "Content-Type": "application/json"
//     }
//   };

//   const email = request.path[0];

//   return wixData.query("AccessTokens")
//     .eq("email", email)
//     .find()
//     .then( (results) => {
//       if(results.items.length > 0) {
//         options.body = {
//           "items": results.items
//         };
//         return ok(options);
//       }
//       options.body = {
//         "error": `'${email}' was not found`
//       };
//       return notFound(options);
//     } )
//     .catch( (error) => {
//       options.body = {
//         "error": error
//       };
//       return serverError(options);
//     } );

// }
