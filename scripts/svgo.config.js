export const multipass = true;
export const plugins = [
    // keep intrinsic sizing optional while preserving viewBox
    "removeDimensions",
    {
        name: "preset-default",
        params: {
            overrides: {
                // always keep viewBox
                removeViewBox: false,
                // enable other default optimizations
            }
        }
    },
    // safe, powerful optimizations
    "cleanupAttrs",
    "convertStyleToAttrs",
    "convertPathData",
    "convertTransform",
    "collapseGroups",
    "mergePaths",
    "cleanupNumericValues",
    {
        name: "removeAttrs",
        params: {
            // remove common non-visual attributes (data-*, id if empty)
            attrs: "^data-.*|^aria-.*"
        }
    }
];
