export const multipass = true;
export const plugins = [
    "removeDimensions",
    {
        name: "removeAttrs",
        params: {
            attrs: "(fill|stroke)"
        }
    },
    {
        name: "preset-default",
        params: {
            overrides: {
                removeViewBox: false
            }
        }
    }
];
