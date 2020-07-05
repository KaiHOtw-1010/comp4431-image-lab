(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
     imageproc.grayscale = function(inputData, outputData) {
         console.log("Applying grayscale...");

         /**
          * TODO: You need to create the grayscale operation here
          */

         for (var i = 0; i < inputData.data.length; i += 4) {
             // Find the grayscale value using simple averaging
             var average = (inputData.data[i]+inputData.data[i+1]+inputData.data[i+2]) / 3;
             // Change the RGB components to the resulting value

             outputData.data[i]     = average;
             outputData.data[i + 1] = average;
             outputData.data[i + 2] = average;
         }
     }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset

            outputData.data[i]     = inputData.data[i] + offset;
            outputData.data[i + 1] = inputData.data[i + 1] + offset;
            outputData.data[i + 2] = inputData.data[i + 2] + offset;

            // Handle clipping of the RGB components
            for (var j = 0; j < 3; ++j) {   // j = 0,1,2 <- R,G,B
                if (outputData.data[i+j] > 255)
                    outputData.data[i+j] = 255;
                else if (outputData.data[i+j] < 0)
                    outputData.data[i+j] = 0;
            }
        }
    }

    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by multiplying a factor

            outputData.data[i]     = inputData.data[i] * factor;
            outputData.data[i + 1] = inputData.data[i + 1] * factor;
            outputData.data[i + 2] = inputData.data[i + 2] * factor;

            // Handle clipping of the RGB components
            for (var j = 0; j < 3; ++j) {   // j = 0,1,2 <- R,G,B
                if (outputData.data[i+j] > 255)
                    outputData.data[i+j] = 255;
            }
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;     // special bit operator
            mask |= 128;    // special bit operator
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
                                       redBits, greenBits, blueBits) {
        console.log("Applying posterization...");

        /**
         * TODO: You need to create the posterization operation here
         */

        // Create the red, green and blue masks
        // A function makeBitMask() is already given
        var Rbitmask = makeBitMask(redBits);
        var Gbitmask = makeBitMask(greenBits);
        var Bbitmask = makeBitMask(blueBits);

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Apply the bitmasks onto the RGB channels

            outputData.data[i]     = inputData.data[i] & Rbitmask;
            outputData.data[i + 1] = inputData.data[i + 1] & Gbitmask;
            outputData.data[i + 2] = inputData.data[i + 2] & Bbitmask;
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
            var average = (inputData.data[i]+inputData.data[i+1]+inputData.data[i+2]) / 3;
            // Change the colour to black or white based on the given threshold

            if (average > thresholdValue)
                outputData.data[i] =
                outputData.data[i+1] =
                outputData.data[i+2] = 255;
            else
                outputData.data[i]     =
                outputData.data[i + 1] =
                outputData.data[i + 2] = 0;
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;

        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        switch (channel) {
            case "red":
                for (var i = 0; i < inputData.data.length; i+=4) {
                    var red = inputData.data[i];    // red has range [0,255]
                    histogram[red] = histogram[red] + 1;
                }
                break;
            case "green":
                for (var i = 0; i < inputData.data.length; i+=4) {
                    var green = inputData.data[i + 1];    // green has range [0,255]
                    histogram[green] = histogram[green] + 1;
                }
                break;
            case "blue":
                for (var i = 0; i < inputData.data.length; i+=4) {
                    var blue = inputData.data[i + 2];    // blue has range [0,255]
                    histogram[blue] = histogram[blue] + 1;
                }
                break;
            case "gray":
                for (var j = 0; j < inputData.data.length; j+=4) {
                    var average = (inputData.data[j]+inputData.data[j+1]+inputData.data[j+2]) / 3;
                    average = Math.round(average);
                    // average has range [0,255]
                    // average not necessarily to be an interger!! Need to round!!
                    // debugging
                    // console.log(average);
                    histogram[average] += 1;
                }
                break;
            default:
                break;
        }

        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min = 0, max = 255;

        /**
         * TODO: You need to build the histogram here
         */

        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var accumulatedPixels_Left = 0;
        var histoStart_Left = 0;
        for (histoStart_Left = 0; histoStart_Left < 256; ++histoStart_Left) {
            accumulatedPixels_Left += histogram[ histoStart_Left ];
            if (accumulatedPixels_Left > pixelsToIgnore)  break;
        }
        for (min = histoStart_Left; min < 256; ++min) {
            if (histogram[min] > 0)  break;
        }

        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var accumulatedPixels_Right = 0;
        var histoStart_Right = 255;
        for (histoStart_Right = 255; histoStart_Right >= 0; --histoStart_Right) {
            accumulatedPixels_Right += histogram[ histoStart_Right ];
            if (accumulatedPixels_Right > pixelsToIgnore)  break;
        }
        for (max = histoStart_Right; max >= 0; --max) {
            if (histogram[max] > 0)  break;
        }

        return {"min": min, "max": max};
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;
                                // (# of pixels) * percentage
        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");
            // debugging
            console.log(histogram.slice(0, 256).join(","));

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);
            // debugging
            console.log(minMax);
            console.log(pixelsToIgnore);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */
            var factor = 255 / range;
            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each pixel based on the minimum and maximum values

                outputData.data[i]     = (inputData.data[i] - min) * factor;
                outputData.data[i + 1] = (inputData.data[i + 1] - min) * factor;
                outputData.data[i + 2] = (inputData.data[i + 2] - min) * factor;
                // handle Clipping!!
                for (var j = 0; j < 3; ++j) {   // j = 0,1,2 <- R,G,B
                    if (outputData.data[i+j] > 255)
                        outputData.data[i+j] = 255;
                }
            }
            // debugging
            var outputHist = buildHistogram(outputData, "gray");
            console.log(outputHist.slice(0,256).join(","));
        }
        else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */
            var Rhistogram, Ghistogram, Bhistogram,
                RminMax,    GminMax,    BminMax   ;
            // Build the R,G,B histograms
            Rhistogram = buildHistogram(inputData, "red");
            Ghistogram = buildHistogram(inputData, "green");
            Bhistogram = buildHistogram(inputData, "blue");

            RminMax = findMinMax(Rhistogram, pixelsToIgnore);
            GminMax = findMinMax(Ghistogram, pixelsToIgnore);
            BminMax = findMinMax(Bhistogram, pixelsToIgnore);

            var Rmin = RminMax.min, Rmax = RminMax.max, Rrange = Rmax - Rmin;
            var Gmin = GminMax.min, Gmax = GminMax.max, Grange = Gmax - Gmin;
            var Bmin = BminMax.min, Bmax = BminMax.max, Brange = Bmax - Bmin;

            var Rfactor = 255 / Rrange, Gfactor = 255 / Grange, Bfactor = 255 / Brange;
            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one

                outputData.data[i]     = (inputData.data[i] - Rmin) * Rfactor;
                outputData.data[i + 1] = (inputData.data[i + 1] - Gmin) * Gfactor;
                outputData.data[i + 2] = (inputData.data[i + 2] - Bmin) * Bfactor;
                // handle Clipping!!
                for (var j = 0; j < 3; ++j) {   // j = 0,1,2 <- R,G,B
                    if (outputData.data[i+j] > 255)
                        outputData.data[i+j] = 255;
                }
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
