(function(imageproc) {
    "use strict";

    /*
     * Apply ordered dithering to the input data
     */
    imageproc.dither = function(inputData, outputData, matrixType) {
        console.log("Applying dithering...");

        /*
         * TODO: You need to extend the dithering processing technique
         * to include multiple matrix types
         */

        // At the moment, the code works only for the Bayer's 2x2 matrix
        // You need to include other matrix types
        var matrix, levels;
        switch (matrixType) {
            // Set up the matrix
            case "bayer2":
                matrix = [ [1, 3],
                           [4, 2] ];
                levels = 5;
                break;
            case "bayer4":
                matrix = [ [ 1,  9,  3, 11],
                           [13,  5, 15,  7],
                           [ 4, 12,  2, 10],
                           [16,  8, 14,  6] ];
                levels = 17;
                break;
            case "line":
                matrix = [ [15, 15, 15, 25],    // value = 0~14: black
                           [15, 15, 25, 15],    // value = 15~24: pattern
                           [15, 25, 15, 15],    // value = 25~levels: white
                           [25, 15, 15, 15] ];
                // debugging
                // matrix = [ [20, 20, 20, 60],    // value = 0~14: black
                //            [20, 20, 60, 20],    // value = 15~24: pattern
                //            [20, 60, 20, 20],    // value = 25~levels: white
                //            [60, 20, 20, 20] ];
                levels = 100;
                break;
            case "diamond":
                matrix = [ [25, 15, 25, 15],    // value = 0~14: black
                           [15, 25, 15, 15],    // value = 15~24: pattern
                           [25, 15, 25, 15],    // value = 25~levels: white
                           [15, 15, 15, 25] ];
                levels = 100;
                break;
            default:
                break;
        }
        // console.log(...matrix);
        var matrixSize = matrix.length;         // the matrix is of "matrixSize-D" array
        // The following code uses Bayer's 2x2 matrix to create the
        // dithering effect. You need to extend it to work for different
        // matrix types

        // debugging
        // var blackCount = 0; var patternCount = 0;
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var pixel = imageproc.getPixel(inputData, x, y);

                // Change the colour to grayscale and normalize it
                var value = (pixel.r + pixel.g + pixel.b) / 3;
                value = value / 255 * levels;
                //      ^ value/255 has range [0,1] -> *level then has range [0,levels]

                // Get the corresponding threshold of the pixel
                // Note the size of matrix
                var threshold = matrix[y % matrixSize][x % matrixSize];

                // Set the colour to black or white based on threshold
                var i = (x + y * outputData.width) * 4; // (x,y) is absolute pixel.
                outputData.data[i]     =                // each pixel has 4 values.
                outputData.data[i + 1] =                // i is index of 1D array
                outputData.data[i + 2] = (value < threshold)? 0 : 255;

                // debugging
                // if (y == inputData.height-1) {
                //     if (matrixType == "line" || matrixType == "diamond") {
                //         if (value >= 0 && value < 15)
                //             ++blackCount;
                //         else if (value >= 15 && value < 25)
                //             ++patternCount;
                //
                //     }
                // }
            }
        }
        // debugging
        // console.log(blackCount, patternCount, inputData.width);
        // console.log(inputData.width, inputData.height);
        // console.log(inputData.data.length / 4);
    }

}(window.imageproc = window.imageproc || {}));
