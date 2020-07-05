(function(imageproc) {
    "use strict";

    /*
     * Apply Kuwahara filter to the input data
     */
    imageproc.kuwahara = function(inputData, outputData, size) {
        console.log("Applying Kuwahara filter...");

        /*
         * TODO: You need to extend the kuwahara function to include different
         * sizes of the filter
         *
         * You need to clearly understand the following code to make
         * appropriate changes
         */

        /*
         * An internal function to find the regional stat centred at (x, y)
         */
        function regionVar(x, y, size) {
            var meanBrightness = 0;  // the average brightness of pixels in the subregion.
            var sumofSquare_var = 0; // the sum of brightness' square of pixels in th subregion.
            var variance = 0;

            // e.g. size=5 (5*5 Kuwahara) -> subregion size=3 (3*3) -> specialIndex=1
            // e.g. size=9 (9*9 Kuwahara) -> subregion size=5 (5*5) -> specialIndex=2
            // e.g. size=13 (13*13 Kuwahara) -> subregion size=7 (7*7) -> specialIndex=3
            var specialIndex =  (size - 1) / 4;
            var subregionSize = (size + 1) / 2; // specialIndex also == (subregionSize - 1) / 2.
            var divisor = subregionSize * subregionSize;

            for (var j = -specialIndex; j <= specialIndex; ++j) {       // e.g. for Kuwa 5*5 (subregion 3*3), j from -1,0,1
                for (var i = -specialIndex; i <= specialIndex; ++i) {   //                                    i from -1,0,1
                    var pixel = imageproc.getPixel(inputData, x+i, y+j);// fourth parameter: default = "extend"
                    var brightness = (pixel.r + pixel.g + pixel.b) / 3; // i.e. grayscale brightness of this specific pixel.

                    // for the calculation of subregion brightness variance
                    sumofSquare_var = sumofSquare_var + brightness * brightness;
                    // for the calculation of subregion brightness mean
                    meanBrightness = meanBrightness + brightness;
                }
            }
            meanBrightness /= divisor;
            sumofSquare_var /= divisor;
            variance = sumofSquare_var - meanBrightness * meanBrightness;

            // Return the variance as an object
            return {
                variance: variance
            };
        }

        function regionMean(x, y, size) {
            var meanR = 0, meanG = 0, meanB = 0; // color average

            var specialIndex =  (size - 1) / 4;
            var subregionSize = (size + 1) / 2; // specialIndex also == (subregionSize - 1) / 2.
            var divisor = subregionSize * subregionSize;

            for (var j = -specialIndex; j <= specialIndex; ++j) {
                for (var i = -specialIndex; i <= specialIndex; ++i) {
                    var pixel = imageproc.getPixel(inputData, x+i, y+j);
                    meanR += pixel.r;
                    meanG += pixel.g;
                    meanB += pixel.b;
                }
            }
            meanR /= divisor;
            meanG /= divisor;
            meanB /= divisor;
            // Return the color mean as an object
            return {
                mean: {r: meanR, g: meanG, b: meanB}
            };
        }



        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                // Find the statistics of the four sub-regions
                var specialIndex =  (size - 1) / 4;
                                        // the location of the center of the subregion
                var regionA = regionVar(x - specialIndex, y - specialIndex, size, inputData);
                var regionB = regionVar(x + specialIndex, y - specialIndex, size, inputData);
                var regionC = regionVar(x - specialIndex, y + specialIndex, size, inputData);
                var regionD = regionVar(x + specialIndex, y + specialIndex, size, inputData);

                // Get the minimum variance value
                var minV = Math.min(regionA.variance, regionB.variance,
                                    regionC.variance, regionD.variance);
                var Mean_of_theRegion;

                var i = (x + y * inputData.width) * 4;

                // Put the mean colour of the region with the minimum
                // variance in the pixel
                switch (minV) {
                case regionA.variance:
                    Mean_of_theRegion = regionMean(x - specialIndex, y - specialIndex, size, inputData);
                    outputData.data[i]     = Mean_of_theRegion.mean.r;
                    outputData.data[i + 1] = Mean_of_theRegion.mean.g;
                    outputData.data[i + 2] = Mean_of_theRegion.mean.b;
                    break;
                case regionB.variance:
                    Mean_of_theRegion = regionMean(x + specialIndex, y - specialIndex, size, inputData);
                    outputData.data[i]     = Mean_of_theRegion.mean.r;
                    outputData.data[i + 1] = Mean_of_theRegion.mean.g;
                    outputData.data[i + 2] = Mean_of_theRegion.mean.b;
                    break;
                case regionC.variance:
                    Mean_of_theRegion = regionMean(x - specialIndex, y + specialIndex, size, inputData);
                    outputData.data[i]     = Mean_of_theRegion.mean.r;
                    outputData.data[i + 1] = Mean_of_theRegion.mean.g;
                    outputData.data[i + 2] = Mean_of_theRegion.mean.b;
                    break;
                case regionD.variance:
                    Mean_of_theRegion = regionMean(x + specialIndex, y + specialIndex, size, inputData);
                    outputData.data[i]     = Mean_of_theRegion.mean.r;
                    outputData.data[i + 1] = Mean_of_theRegion.mean.g;
                    outputData.data[i + 2] = Mean_of_theRegion.mean.b;
                }
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
