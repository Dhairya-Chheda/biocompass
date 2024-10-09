import wixLocationFrontend from 'wix-location-frontend';
import * as constants from 'public/constants'
import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(function () {
	wixLocationFrontend.to(constants.REGISTER)
	wixWindowFrontend.lightbox.close()
});