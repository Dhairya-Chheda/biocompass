import wixLocation from 'wix-location';

$w.onReady(function () {
	$w('#healthGoalsRepeater').onItemReady(($item, itemData, index) => {
		$item('#healthGoalRepeaterItem').onClick(() => {
			wixLocation.to(`/products?type=healthGoals&q=${itemData._id}`)
		})
	})

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

});