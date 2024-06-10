const imgs = document.querySelectorAll('.img-select a');
const imgBtns = [...imgs];
let imgId = 1;

imgBtns.forEach((imgItem) => {
    imgItem.addEventListener('click', (event) => {
        // event.preventDefault();
        imgId = imgItem.dataset.id;
        slideImage();
    });
});

function slideImage() {
    const displayWidth = document.querySelector('.img-showcase img:first-child').clientWidth;
    document.querySelector('.img-showcase').style.transform = `translateX(${- (imgId - 1) * displayWidth}px)`;

    // Update the zoom functionality to the current image
    updateZoomFunctionality();
}

window.addEventListener('resize', slideImage);

function updateZoomFunctionality() {
    const container = document.getElementById('container');
    const images = document.querySelectorAll('.img-showcase img');

    // Remove previous event listeners
    images.forEach(image => {
        const newImage = image.cloneNode(true);
        image.parentNode.replaceChild(newImage, image);
    });

    // Attach event listeners to the current image
    const currentImg = document.querySelector('.img-showcase img:nth-child(' + imgId + ')');

    container.addEventListener("mousemove", (e) => {
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;

        currentImg.style.transformOrigin = `${x}px ${y}px`;
        currentImg.style.transform = "scale(2)";
    });

    container.addEventListener("mouseleave", () => {
        currentImg.style.transformOrigin = 'center';
        currentImg.style.transform = "scale(1)";
    });
}

// Initialize zoom functionality for the first image
updateZoomFunctionality();
