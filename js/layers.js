(function(imageproc) {
    "use strict";

    /*
     * Apply the basic processing operations
     */
    function applyBasicOp(inputImage, outputImage) {
        switch (currentBasicOp) {
            // Apply negation
            case "negation":
                imageproc.negation(inputImage, outputImage);
                break;

            // Apply grayscale
            case "grayscale":
                imageproc.grayscale(inputImage, outputImage);
                break;

            // Apply brightness
            case "brightness":
                var offset = parseInt($("#brightness-offset").val());
                imageproc.brightness(inputImage, outputImage, offset);
                break;

            // Apply contrast
            case "contrast":
                var factor = parseFloat($("#contrast-factor").val());
                imageproc.contrast(inputImage, outputImage, factor);
                break;

            // Apply posterization
            case "posterization":
                var rbits = parseInt($("#posterization-red-bits").val());
                var gbits = parseInt($("#posterization-green-bits").val());
                var bbits = parseInt($("#posterization-blue-bits").val());
                imageproc.posterization(inputImage, outputImage, rbits, gbits, bbits);
                break;

            // Apply threshold
            case "threshold":
                var threshold = parseFloat($("#threshold-value").val());
                imageproc.threshold(inputImage, outputImage, threshold);
                break;

            // Apply comic colour
            case "comic-color":
                var saturation = parseInt($("#comic-color-saturation").val());
                imageproc.comicColor(inputImage, outputImage, saturation);
                break;

            // Apply automatic contrast
            case "auto-contrast":
                var type = $("#auto-contrast-type").val();
                var percentage = parseInt($("#auto-contrast-percentage").val()) / 100.0;
                imageproc.autoContrast(inputImage, outputImage, type, percentage);
                break;

            /* TODO: mini-project */
            // Apply unsharp masking
            case "unsharp-mask":
                // debugging
                console.log("calling USM");
                var resulttype    = $("#unsharp-result-type").val();  // "gray" or "color"
                var amount        = parseInt($("#unsharp-mask-amount").val());
                var radius        = parseInt($("#unsharp-mask-radius").val());
                var thresholdUSM  = parseInt($("#unsharp-mask-threshold").val());
                var kernelSize    = parseInt($("#unsharp-gaussian-kernel-size").val());

                if ($("#unsharp-use-suggested-size").prop("checked")) {
                    // debugging
                    console.log("suggested kernel size will be used!");
                    var sigma  = (radius + 1) / Math.sqrt(2 * Math.log(255));
                    kernelSize = 2 * Math.ceil(3 * sigma) + 1;
                }
                // else: kernelSize = parseInt($("#unsharp-gaussian-kernel-size").val()); as defined. That is, suggested size is not used.

                if (resulttype == "gray") {
                    var grayscale = imageproc.createBuffer(outputImage);
                    imageproc.grayscale(inputImage, grayscale);
                    imageproc.unsharpMask(grayscale, outputImage, resulttype, amount, radius, thresholdUSM, kernelSize);
                }
                else if (resulttype == "color") {  // else
                    imageproc.unsharpMask(inputImage, outputImage, resulttype, amount, radius, thresholdUSM, kernelSize);
                }
                // passing "resulttype" to imageproc.unsharpMask() is useless, but for debugging.
                break;
        }
    }

    /*
     * Apply the base layer operations
     */
    function applyBaseLayerOp(inputImage, processedImage, outputImage) {
        switch (currentBaseLayerOp) {
            // Apply blur
            case "blur":
                if ($("#blur-input").val() == "processed")
                    inputImage = processedImage;
                var size = parseInt($("#blur-kernel-size").val());
                imageproc.blur(inputImage, outputImage, size);
                break;

            // Apply gaussian blur
            case "gaussian-blur":
                // debugging
                console.log("calling gaussian-blur");
                console.log($("#gaussian-blur-input").val());
                if ($("#gaussian-blur-input").val() == "processed") {
                    // debugging
                    // console.log("processed?")
                    inputImage = processedImage;
                }
                var radius        = parseInt($("#gaussian-blur-radius").val());
                var kernelSize    = parseInt($("#gaussian-blur-kernel-size").val());

                if ($("#gaussian-blur-use-suggested-size").prop("checked")) {
                    // debugging
                    console.log("suggested kernel size will be used!");
                    var sigma  = (radius + 1) / Math.sqrt(2 * Math.log(255));
                    kernelSize = 2 * Math.ceil(3 * sigma) + 1;
                }
                // else: kernelSize = parseInt($("#unsharp-gaussian-kernel-size").val()); as defined. That is, suggested size is not used.
                imageproc.gaussianBlur(inputImage, outputImage, radius, kernelSize);
                break;

            // Apply kuwahara
            case "kuwahara":
                if ($("#kuwahara-input").val() == "processed")
                    inputImage = processedImage;
                var size = parseInt($("#kuwahara-filter-size").val());
                imageproc.kuwahara(inputImage, outputImage, size);
                break;
        }
    }

    /*
     * Apply the shade layer operations
     */
    function applyShadeLayerOp(inputImage, processedImage, outputImage) {
        switch (currentShadeLayerOp) {
            // Apply dither
            case "dither":
                if ($("#dither-input").val() == "processed")
                    inputImage = processedImage;
                imageproc.dither(inputImage, outputImage,
                                 $("#dither-matrix-type").val());
                break;
        }
    }

    /*
     * Apply the outline layer operations
     */
    function applyOutlineLayerOp(inputImage, processedImage, outputImage) {
        switch (currentOutlineLayerOp) {
            // Apply sobel edge detection
            case "sobel":
                if ($("#sobel-input").val() == "processed")
                    inputImage = processedImage;

                // Use the grayscale image
                var grayscale = imageproc.createBuffer(outputImage);
                imageproc.grayscale(inputImage, grayscale);

                // Blur if needed
                if ($("#sobel-blur").prop("checked")) {
                    var blur = imageproc.createBuffer(outputImage);
                    var size = parseInt($("#sobel-blur-kernel-size").val());
                    imageproc.blur(grayscale, blur, size);
                    grayscale = blur;
                }

                var threshold = parseInt($("#sobel-threshold").val());
                imageproc.sobelEdge(grayscale, outputImage, threshold);

                // Flip edge values
                if ($("#sobel-flip").prop("checked")) {
                    for (var i = 0; i < outputImage.data.length; i+=4) {
                        if (outputImage.data[i] == 0) {     // r=g=b (since grayscale) == black
                            outputImage.data[i]     =
                            outputImage.data[i + 1] =
                            outputImage.data[i + 2] = 255;
                        }
                        else {
                            outputImage.data[i]     =
                            outputImage.data[i + 1] =
                            outputImage.data[i + 2] = 0;
                        }
                    }
                }
                break;
        }
    }

    /*
     * The image processing operations are set up for the different layers.
     * Operations are applied from the base layer to the outline layer. These
     * layers are combined appropriately when required.
     */
    imageproc.operation = function(inputImage, outputImage) {
        // Apply the basic processing operations
        var processedImage = inputImage;
        if (currentBasicOp != "no-op") {
            processedImage = imageproc.createBuffer(outputImage);
            applyBasicOp(inputImage, processedImage);
        }                                                // Note: processedImage == result from "basic processing"
                                                         //  c.f. baseLayer      == result from "base layer"
        // Apply the base layer operations               // so for base/shade/outline layer, choosing "Processed Image"
        var baseLayer = processedImage;                  // as input means we will use the result from "basic processing".
        if (currentBaseLayerOp != "no-op") {
            baseLayer = imageproc.createBuffer(outputImage);
            applyBaseLayerOp(inputImage, processedImage, baseLayer);
        }

        // Apply the shade layer operations
        var shadeLayer = baseLayer;
        if (currentShadeLayerOp != "no-op") {
            shadeLayer = imageproc.createBuffer(outputImage);
            applyShadeLayerOp(inputImage, processedImage, shadeLayer);

            // Show base layer for dithering
            if (currentShadeLayerOp == "dither" &&
                $("#dither-transparent").prop("checked")) {
                // debugging
                // console.log("checked");
                /**
                 * TODO: You need to show the base layer (baseLayer) for
                 * the white pixels (transparent)
                 */
                 // variable shadeLayer stores the "shade layer image."
                 // variable baseLayer  stores the "base  layer image."
                 for (var i = 0; i < shadeLayer.data.length; i+=4) {
                     if (shadeLayer.data[i] == 255 &&
                          shadeLayer.data[i+1] == 255 &&
                          shadeLayer.data[i+2] == 255)  {            // current pixel is white,
                         shadeLayer.data[i] = baseLayer.data[i];     // replace it with base
                         shadeLayer.data[i+1] = baseLayer.data[i+1]; // layer pixel
                         shadeLayer.data[i+2] = baseLayer.data[i+2];
                     }
                 }
            }
        }

        // Apply the outline layer operations
        var outlineLayer = shadeLayer;
        if (currentOutlineLayerOp != "no-op") {
            outlineLayer = imageproc.createBuffer(outputImage);
            applyOutlineLayerOp(inputImage, processedImage, outlineLayer);

            // Show shade layer for non-edge pixels
            if (currentOutlineLayerOp == "sobel" &&
                $("#sobel-transparent").prop("checked")) {
                // debugging
                // console.log("checked");
                /**
                 * TODO: You need to show the shade layer (shadeLayer) for
                 * the non-edge pixels (transparent)
                 */
                for (var i = 0; i < outlineLayer.data.length; i+=4) {
                    // debugging
                    // outlineLayer.data[i] = outlineLayer.data[i+1] = outlineLayer.data[i+2] = 128;
                    // case 1: sobel-flip checked -> edge==black, non-edge==white (255)
                    if ( $("#sobel-flip").prop("checked") && outlineLayer.data[i]==255 ) {
                        outlineLayer.data[i]   = shadeLayer.data[i];
                        outlineLayer.data[i+1] = shadeLayer.data[i+1];
                        outlineLayer.data[i+2] = shadeLayer.data[i+2];
                    }
                    // case 2: sobel-flip not checked -> edge==white, non-edge==black (0)
                    else if ( !$("#sobel-flip").prop("checked") && outlineLayer.data[i]==0 ) {
                        outlineLayer.data[i]   = shadeLayer.data[i];
                        outlineLayer.data[i+1] = shadeLayer.data[i+1];
                        outlineLayer.data[i+2] = shadeLayer.data[i+2];
                    }
                }
                // debugging
                // console.log("done");
            }
        }

        // Show the accumulated image
        imageproc.copyImageData(outlineLayer, outputImage);
    }

}(window.imageproc = window.imageproc || {}));
