(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.gaussianBlur = function(inputData, outputData, radius, kernelSize) {
        console.log("Applying Gaussian blur...");

        var kernel     = [];
        var sigma      = (radius + 1) / Math.sqrt(2 * Math.log(255));
        console.log("Radius: ", radius, ", Sigma: ", sigma, "\n, Size: ", kernelSize);

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
        for (var j = 0; j < kernelSize; ++j) {
            for (var i = 0; i < kernelSize; ++i) {
                kernel[j][i] /= weightSum;          // such that each entry of the kernel sums up to 1.
            }
        }    // till this step, the corresponding gaussian kernel is produced (based on sigma, kernelSize/specialIndex).
        // console.log(...kernel);

        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
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
                    var i = (x + y * outputData.width) * 4;         // (x,y) is absolute pixel.
                    outputData.data[i]     = Rsum;     // R value
                    outputData.data[i + 1] = Gsum;     // G value
                    outputData.data[i + 2] = Bsum;     // B value
                }
            }
        }
        console.log("finish Gaussian Blur");
    }

}(window.imageproc = window.imageproc || {}));
