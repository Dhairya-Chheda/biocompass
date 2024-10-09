import { authentication } from 'wix-members-frontend';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import * as constants from 'public/constants'

$w.onReady(function () {

	$w("#confirmLogout").onClick(() => {
		authentication.logout();
		wixLocation.to(constants.REGISTER);
	});

	$w('#goBack').onClick(() => {
		wixWindow.lightbox.close();
	})

});