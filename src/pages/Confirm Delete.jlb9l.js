import wixWindow from 'wix-window';

$w.onReady(function () {
    // Get the productId from the lightbox data
    const productId = wixWindow.lightbox.getContext().productId;

    // Set the confirmation message
    $w('#confirmationMessage').text = `Are you sure you want to delete the product : ${productId}?`;

    // Handle the delete button click
    $w('#delete').onClick(() => {
        wixWindow.lightbox.close('confirm'); // Close the lightbox and send 'confirm' result
    });

    // Handle the cancel button click
    $w('#cancel').onClick(() => {
        wixWindow.lightbox.close('cancel'); // Close the lightbox and send 'cancel' result
    });
});
