import * as constants from 'public/constants';
import wixData from 'wix-data';

export function viewImageWhenUpload(uploadButton, displayElement, errorMessageElement) {
    console.log(errorMessageElement.text);

    const resetErrorMessage = () => {
        errorMessageElement.text = "";
        errorMessageElement.hide();
    };

    const showErrorMessage = (message) => {
        errorMessageElement.text = message;
        errorMessageElement.show();
    };

    resetErrorMessage();
    console.log("Uploading image....");

    return uploadButton.uploadFiles()
        .then((uploadedFiles) => {
            if (uploadedFiles.length > 0) {
                const fileUrl = uploadedFiles[0].fileUrl;
                displayElement.src = fileUrl;
                return fileUrl
            } else {
                console.error("No files were uploaded.");
                showErrorMessage("No files were uploaded. Please select a file and try again.");
            }
        })
        .catch((uploadError) => {
            console.error("Error uploading image:", uploadError);
            showErrorMessage("Error uploading image. Please try again.");
        });
}



export function viewVideoWhenUpload(uploadButton, displayElement, errorMessageElement) {
    const resetErrorMessage = () => {
        errorMessageElement.text = "";
        errorMessageElement.hide();
    };

    const showErrorMessage = (message) => {
        errorMessageElement.text = message;
        errorMessageElement.show();
    };

    resetErrorMessage()
    console.log("Uploading video...");

    return uploadButton.uploadFiles()
        .then((uploadedFiles) => {
            if (uploadedFiles.length > 0) {
                const uploadedFile = uploadedFiles[0];
                const fileUrl = uploadedFile.fileUrl; // URL to preview the video
                const videoRef = uploadedFile.mediaId; // Unique media ID provided by Wix
                const posterUri = uploadedFile.posterUri; // Thumbnail URL
                const posterWidth = uploadedFile.posterWidth;
                const posterHeight = uploadedFile.posterHeight;

                const wixVideoUrl = `wix:video://v1/${videoRef}/_#posterUri=${posterUri}&posterWidth=${posterWidth}&posterHeight=${posterHeight}`;

                displayElement.src = fileUrl;  // Set the video source to the uploaded file's URL
                return wixVideoUrl
                // setVideoUrlInDataset(wixVideoUrl);  // Save the formatted Wix video URL in the dataset
            } else {
                showErrorMessage("No files were uploaded. Please select a file and try again.");
                console.error("No files were uploaded.");
            }
        })
        .catch((uploadError) => {
            showErrorMessage("Error uploading video. Please try again.");
            console.error("Error uploading video:", uploadError);
        });
}

export function getAllChildren(element) {
    // Initialize an empty array to store all elements
    let allElements = [];

    // Get all children of the given element
    let children = element.children;

    // Iterate over each child
    children.forEach(child => {
        // Add the child element to the result array
        allElements.push(child);

        // If the child is a "box", recursively get its children
        if (child.type === '$w.Box') {
            allElements = allElements.concat(getAllChildren(child));  // Recursively add the children
        }
    });

    // Return the array containing all elements
    return allElements;
}

