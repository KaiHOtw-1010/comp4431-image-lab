(function(imageproc) {
    "use strict";

    /*
     * Unsharp Mask Sharpening
     */
    imageproc.unsharpMask = function(inputData, outputData, resulttype, amount, radius, threshold, kernelSize) {
        // debugging
        // console.log(inputData.width, inputData.height);
        console.log("Applying Unsharp Masking...");
        console.log("Result to be: ", resulttype, "\nAmount: ", amount, ", Radius: ", radius, ", Threshold: ", threshold);

        /* Get to know GaussianBlur's
         * sigma and kernel size from the parameter "radius" (modified: kernel size can be "suggested" or "assigned").
         */
        var kernel     = [];                                            // GaussianBlur kernel
        var sigma      = (radius + 1) / Math.sqrt(2 * Math.log(255));   // according to Wiki.  e.g. 0.6/, 0.9/, 1.2/, 1.5/, ..., 3.0/
        // var kernelSize = 2 * Math.ceil(3 * sigma) + 1;                  // according to Wiki.  e.g.    5,    7,    9,   11, ...,   21
        // ^ calculation of suggested kernel size is moved to "layer.js"
        // debugging
        // deubgging: var sigma = 0.84089642;  // to check if kernel is calculated correctly
        // deubgging: var kernelSize = 7;      // to check if kernel is calculated correctly
        // console.log(sigma, kernelSize);
        // debugging
        console.log("Radius: ", radius, ", Sigma: ", sigma, "\n, Size: ", kernelSize);

        /* Create Gaussian kernel
         * based on derived sigma and kernelSize (specialIndex)
         */
        var specialIndex = (kernelSize - 1) / 2;  console.log("specialIndex: ", specialIndex);
        var weightSum = 0;
        for (var j = -specialIndex; j <= specialIndex; ++j) {       // e.g. for kernelSize=3, specialIndex j = -1,0,1 / kernelSize=5, specialIndex j = -2,-1,0,1,2
            kernel.push([]);
            for (var i = -specialIndex; i <= specialIndex; ++i) {   //                        specialIndex i = -1,0,1 / kernelSize=5, specialIndex i = -2,-1,0,1,2
                var entry = (1 / (2 * Math.PI * sigma * sigma)) * Math.pow(Math.E, -(i * i + j * j) / (2 * sigma * sigma));
                kernel[j + specialIndex].push(entry);
                weightSum += entry;
            }
        }
        // debugging
        // console.log(...kernel);
        for (var j = 0; j < kernelSize; ++j) {
            for (var i = 0; i < kernelSize; ++i) {
                kernel[j][i] /= weightSum;          // such that each entry of the kernel sums up to 1.
            }
        }   // till this step, the corresponding gaussian kernel is produced (based on sigma, kernelSize/specialIndex).
        // debugging
        // console.log(...kernel);

        /* Show
         * only highpass (edges / details)
         */
        if ($("#unsharp-show-highpass-grayscale").prop("checked")) {
            console.log("Show highpass detail of grayscale version only. (effect is similar to applying Laplace operator)")
            /* Transform original image
             * to grayscale (does not matter if it is already in grayscale).
             */
            var grayscale = imageproc.createBuffer(outputData);
            imageproc.grayscale(inputData, grayscale);
            /* Apply GaussianBlur kernel
             * to the whole "grayscaled" input image, and store the blurred result in a buffer
             */
            // Now, we regard the ImageDate object "grayscale" as "inputData".
            var gaussianBlurred = imageproc.createBuffer(outputData);
            for (var y = 0; y < grayscale.height; ++y) {
                for (var x = 0; x < grayscale.width; ++x) {
                    // Use imageproc.getPixel() to get the pixel values
                    // over the kernel
                    var Blurred_brightness = 0;
                    for (var j = -specialIndex; j <= specialIndex; ++j) {       // e.g. for kernelSize=3, j from -1,0,1
                        for (var i = -specialIndex; i <= specialIndex; ++i) {   //                        i from -1,0,1
                            var pixel = imageproc.getPixel(grayscale, x+i, y+j);// get information of that specific pixel.
                            var value = (pixel.r + pixel.g + pixel.b) / 3;      // or simply just pixel.r because the image is grayscale.
                            Blurred_brightness = Blurred_brightness +
                                                    kernel[j+specialIndex][i+specialIndex] * value;
                        }
                    }
                    // Then set the blurred result to the output data
                    var i = (x + y * outputData.width) * 4;         // (x,y) is absolute pixel.
                    gaussianBlurred.data[i]     =
                    gaussianBlurred.data[i + 1] =
                    gaussianBlurred.data[i + 2] = Blurred_brightness;
                }
            }

            /* Now the ImageData object "gaussianBlurred" stores the blurred version of original->grayscale image.
             * Start performing unsharp masking!!
             */
             for (var i = 0; i < grayscale.data.length; i += 4) {
                 // What is highpass? it tells the details (edges) of the image.
                 // Conceptually, highpass = original - lowpass. Here lowpass is GaussianBlur.
                 var highpass = grayscale.data[i] - gaussianBlurred.data[i];

                 if (Math.abs(highpass) > threshold) {
                     // highpass = grayscale.data[i] + (amount / 100) * highpass;         // now highpass stores "unsharp mask sharpened" brightness-value of pixel.
                     // Beware of any possible clipping!
                     // if (highpass > 255)
                     //     highpass = 255;
                     // else if (highpass < 0)
                     //     highpass = 0;
                     outputData.data[i]     =
                     outputData.data[i + 1] =
                     outputData.data[i + 2] = highpass; // or the edge.
                 }
                 else if (Math.abs(highpass) <= threshold) {
                     outputData.data[i]     =
                     outputData.data[i + 1] =
                     outputData.data[i + 2] = 0;  // then only black will be shown.
                 }
             }
        }

        /* Show
         * USM result
         */
        else {
            console.log("Will show the unsharp mask Sharpened result!!");
            /* Apply GaussianBlur kernel
             * to the whole input image, and store the blurred result in a buffer
             */
            var gaussianBlurred = imageproc.createBuffer(outputData);  // or imageproc.createBuffer(inputData): to create an ImageData object.
            // imageproc.copyImageData(inputData, gaussianBlurred);       // copy inputData to "not yet blurred" gaussianBlurred ImageData object.
            //                                                            // make sure that the copy is done correctly.
            for (var y = 0; y < inputData.height; ++y) {
                for (var x = 0; x < inputData.width; ++x) {
                    // Use imageproc.getPixel() to get the pixel values
                    // over the kernel
                    var Rsum = 0, Gsum = 0, Bsum = 0;
                    for (var j = -specialIndex; j <= specialIndex; ++j) {       // e.g. for kernelSize=3, j from -1,0,1
                        for (var i = -specialIndex; i <= specialIndex; ++i) {   //                        i from -1,0,1
                            var pixel = imageproc.getPixel(inputData, x+i, y+j);// get information of that specific pixel.
                            Rsum = Rsum +
                                    kernel[j+specialIndex][i+specialIndex] * pixel.r;
                            Gsum = Gsum +
                                    kernel[j+specialIndex][i+specialIndex] * pixel.g;
                            Bsum = Bsum +
                                    kernel[j+specialIndex][i+specialIndex] * pixel.b;
                        }
                    }
                    // Then set the blurred result to the output data
                    var i = (x + y * outputData.width) * 4;         // (x,y) is absolute pixel.
                    gaussianBlurred.data[i]     = Rsum;     // R value
                    gaussianBlurred.data[i + 1] = Gsum;     // G value
                    gaussianBlurred.data[i + 2] = Bsum;     // B value
                }
            }

            /* Now the ImageData object "gaussianBlurred" stores the blurred version of original image.
             * Start performing unsharp masking!!
             */
            for (var i = 0; i < inputData.data.length; i += 4) {
                // What is highpass? it tells the details (edges) of the image.
                // Conceptually, highpass = original - lowpass. Here lowpass is GaussianBlur.
                var highpassR = inputData.data[i]     - gaussianBlurred.data[i];
                var highpassG = inputData.data[i + 1] - gaussianBlurred.data[i + 1];
                var highpassB = inputData.data[i + 2] - gaussianBlurred.data[i + 2];

                if (Math.abs(highpassR) > threshold) {
                    highpassR = inputData.data[i] + (amount / 100) * highpassR;         // now highpassR stores "unsharp mask sharpened" R-value of pixel.
                    // Beware of any possible clipping!
                    if (highpassR > 255)
                        highpassR = 255;
                    else if (highpassR < 0)
                        highpassR = 0;
                    outputData.data[i]     = highpassR;
                }
                else if (Math.abs(highpassR) <= threshold) {
                    outputData.data[i]     = inputData.data[i];
                }

                if (Math.abs(highpassG) > threshold) {
                    highpassG = inputData.data[i + 1] + (amount / 100) * highpassG;     // now highpassG stores "unsharp mask sharpened" G-value of pixel.
                    // Beware of any possible clipping!
                    if (highpassG > 255)
                        highpassG = 255;
                    else if (highpassG < 0)
                        highpassG = 0;
                    outputData.data[i + 1] = highpassG;
                }
                else if (Math.abs(highpassG) <= threshold) {
                    outputData.data[i + 1] = inputData.data[i + 1];
                }

                if (Math.abs(highpassB) > threshold) {
                    highpassB = inputData.data[i + 2] + (amount / 100) * highpassB;     // now highpassB stores "unsharp mask sharpened" B-value of pixel.
                    // Beware of any possible clipping!
                    if (highpassB > 255)
                        highpassB = 255;
                    else if (highpassB < 0)
                        highpassB = 0;
                    outputData.data[i + 2] = highpassB;
                }
                else if (Math.abs(highpassB) <= threshold) {
                    outputData.data[i + 2] = inputData.data[i + 2];
                }
                // debugging
                // outputData.data[i]     = highpassR;
                // outputData.data[i + 1] = highpassG;
                // outputData.data[i + 2] = highpassB;
                // outputData.data[i]     = inputData.data[i];
                // outputData.data[i + 1] = inputData.data[i + 1];
                // outputData.data[i + 2] = inputData.data[i + 2];
            }
        }

        // debugging
        // for (var i = 0; i < inputData.data.length; i += 4) {
        //     outputData.data[i]     = gaussianBlurred.data[i];
        //     outputData.data[i + 1] = gaussianBlurred.data[i + 1];
        //     outputData.data[i + 2] = gaussianBlurred.data[i + 2];
        //     // outputData.data[i]     = 255 - inputData.data[i];
        //     // outputData.data[i + 1] = 255 - inputData.data[i + 1];
        //     // outputData.data[i + 2] = 255 - inputData.data[i + 2];
        // }
        // debugging
        console.log("finish USM");
    }


}(window.imageproc = window.imageproc || {}));
