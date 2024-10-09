import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import * as constants from 'public/constants';
import wixPricingPlansFrontend from 'wix-pricing-plans-frontend';

$w.onReady(function () {
    $w("#purchasePlan").onClick(() => {
        
    });

    $w('#plansRepeater').onItemReady(($item, itemData, index) => {
        $item('#purchasePlan').onClick(() => {
            if (!wixUsers.currentUser.loggedIn) {
                wixLocation.to(constants.BUSINESS_REGISTER);
                return
            } 

            if($item('#planName').text === 'BASIC'){
                wixPricingPlansFrontend.customPurchaseFlow.navigateToCheckout({planId: constants.BASIC_PLAN})
            }
            else if($item('#planName').text === 'ESSENTIALS'){
                wixPricingPlansFrontend.customPurchaseFlow.navigateToCheckout({planId: constants.ESSENTIALS_PLAN})
            }
            else if($item('#planName').text === 'PRO'){
                wixPricingPlansFrontend.customPurchaseFlow.navigateToCheckout({planId: constants.PRO_PLAN})
            }
            else if($item('#planName').text === 'PREMIUM'){
                wixPricingPlansFrontend.customPurchaseFlow.navigateToCheckout({planId: constants.PREMIUM_PLAN})
            }
        })
    })
});
