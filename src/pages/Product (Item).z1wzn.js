import wixUsers from 'wix-users';
import wixData from 'wix-data';
import * as constants from 'public/constants';

$w.onReady(function () {
    checkIfLiked();

    $w('#addToFavouritesButton').onClick(() => {
        toggleFavourite();
    });
});

function checkIfLiked() {
    const currentUser = wixUsers.currentUser;

    if (currentUser.loggedIn) {
        const userId = currentUser.id;
        const product = $w('#dynamicDataset').getCurrentItem();
        const productId = product._id;

        wixData.query(constants.CUSTOMER_FAVOURITE_DATABASE)
            .eq('customerId', userId)
            .eq('productId', productId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    updateButtonStyle('liked');
                } else {
                    updateButtonStyle('default');
                }
            })
            .catch((err) => {
                console.error('Error querying favourites:', err);
            });
    } else {
        $w('#addToFavouritesButton').hide()
    }
}

function toggleFavourite() {
    const currentUser = wixUsers.currentUser;

    if (currentUser.loggedIn) {
        const userId = currentUser.id;
        const product = $w('#dynamicDataset').getCurrentItem();
        const productId = product._id;

        wixData.query(constants.CUSTOMER_FAVOURITE_DATABASE)
            .eq('customerId', userId)
            .eq('productId', productId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    const favouriteId = results.items[0]._id;
                    wixData.remove(constants.CUSTOMER_FAVOURITE_DATABASE, favouriteId)
                        .then(() => {
                            console.log('Favourite removed successfully');
                            updateButtonStyle('default');
                        })
                        .catch((err) => {
                            console.error('Error removing favourite:', err);
                        });
                } else {
                    const favouriteData = {
                        productName: product.productName,
                        productId: productId,
                        customerId: userId
                    };

                    wixData.insert(constants.CUSTOMER_FAVOURITE_DATABASE, favouriteData)
                        .then((result) => {
                            console.log('Favourite added successfully:', result);
                            updateButtonStyle('liked');
                        })
                        .catch((err) => {
                            console.error('Error adding favourite:', err);
                
                        });
                }
            })
            .catch((err) => {
                console.error('Error querying favourites:', err);
            });
    } else {
        console.warn('User not logged in');
        // wixLocation.to(constants.REGISTER);
        $w('#addToFavouritesButton').hide()
    }
}

function updateButtonStyle(state) {
    if (state === 'liked') {
        $w('#addToFavouritesButton').icon = constants.FAVOURITE_FILL_ICON
    } else {
        $w('#addToFavouritesButton').icon = constants.FAVOURITE_ICON
    }
}
