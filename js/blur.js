(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        var kernel = [];
        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */  // kernelSize = 3, 5, 7, 9
        for (var j = 0; j < kernelSize; ++j) {
            kernel.push([]);
            for (var i = 0; i < kernelSize; ++i) {
                kernel[j].push(1);
            }
        }
        var specialIndex = (kernelSize - 1) / 2; // 1 for kernelSize=3, 2 for kernelSize=5, ...
        var divisor = kernelSize * kernelSize;   // 9 for kernelSize=3, 25 for kernelSize=5, ...
        // debugging
        // console.log(...kernel); console.log(specialIndex); console.log(divisor);

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
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
                var Rmean = Rsum / divisor, Gmean = Gsum / divisor, Bmean = Bsum / divisor;

                // Then set the blurred result to the output data

                var i = (x + y * outputData.width) * 4;         // (x,y) is absolute pixel.
                outputData.data[i]     = Rmean;     // R value
                outputData.data[i + 1] = Gmean;     // G value
                outputData.data[i + 2] = Bmean;     // B value
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
