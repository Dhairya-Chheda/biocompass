/*import { Permissions, webMethod } from 'wix-web-module';
import { members } from 'wix-members-backend';

export const myUpdateMemberFunction = webMethod(
  Permissions.Anyone,
  async (id, customInstagramLink, customYoutubeChannel, firstName, lastName, contactNumber, profilePhotoUrl) => {
    const memberUpdate = {
      contactDetails: {
        firstName: firstName,
        lastName: lastName,
        customFields: {
          'custom.instagram-link': {
            name: 'Instagram Link',
            value: customInstagramLink
          },
          'custom.youtube-channel': {
            name: 'YouTube Channel',
            value: customYoutubeChannel
          }
        }
      },
      profile: {
        profilePhoto: {
          url: profilePhotoUrl // Ensure the profile photo URL is correctly structured
        }
      }
    };
    console.log('Data : ', memberUpdate);

    try {
      const updatedMember = await members.updateMember(id, memberUpdate);
      return updatedMember;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update member');
    }
  }
);

export const myGetMemberFunction = webMethod(
  Permissions.Anyone,
  async (id, options) => {
    try {
      const member = await members.getMember(id, options);
      return member;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get member');
    }
  }
);
*/


import { Permissions, webMethod } from 'wix-web-module';
import { members } from 'wix-members-backend';
import wixData from 'wix-data';

export const myUpdateMemberFunction = webMethod(
  Permissions.Anyone,
  (id, customInstagramLink, customYoutubeChannel, firstName, lastName, contactNumber, profilePhotoUrl) => {
    const memberUpdate = {
      contactDetails: { 
        firstName: firstName,
        lastName: lastName,
        contactNumber: contactNumber,
        customFields: {
          'custom.instagram-link': {
            name: 'Instagram Link',
            value: customInstagramLink
          },
          'custom.youtube-channel': {
            name: 'YouTube Channel',
            value: customYoutubeChannel
          }
        }
      },
      /*profile: {
        profilePhoto : {
          "url" : profilePhotoUrl // Ensure the profile photo URL is correctly structured
        }
      }*/
    };
    
    return members
      .updateMember(id, memberUpdate)
      .then((updatedMember) => {
        return updatedMember;
      })
      .catch((error) => {
        console.error(error);
        throw new Error('Failed to update member');
      });
  }
);

//    291e7e34-54bb-414d-9a00-573b32d1f5bb


export const myGetMemberFunction = webMethod(

  Permissions.Anyone,

  (id, options) => {

    return members

      .getMember(id, options)

      .then((member) => {

        const slug = member.profile.slug;

        const name = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;

        const contactId = member.contactId;

        return member;

      })

      .catch((error) => {

        console.error(error);

      });

  },

);