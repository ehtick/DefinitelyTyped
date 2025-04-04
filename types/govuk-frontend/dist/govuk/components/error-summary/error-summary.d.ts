import { ConfigurableComponent } from "../../common/configuration.js";

/**
 * Error summary component
 *
 * Takes focus on initialisation for accessible announcement, unless disabled in
 * configuration.
 */
export class ErrorSummary extends ConfigurableComponent<
    ErrorSummaryConfig,
    HTMLElement
> {
    /**
     * Name for the component used when initialising using data-module attributes.
     */
    static moduleName: string;

    /**
     * Error summary default config
     *
     * @see {@link ErrorSummaryConfig}
     * @constant
     */
    static defaults: ErrorSummaryConfig;

    /**
     * Error summary config schema
     *
     * @constant
     * @satisfies {Schema<ErrorSummaryConfig>}
     */
    static schema: Readonly<{
        properties: {
            disableAutoFocus: {
                type: "boolean";
            };
        };
    }>;

    /**
     * @param {Element | null} $root - HTML element to use for error summary
     * @param {ErrorSummaryConfig} [config] - Error summary config
     */
    constructor($root: Element | null, config?: ErrorSummaryConfig);
}

/**
 * Error summary config
 */
export interface ErrorSummaryConfig {
    /**
     * - If set to `true` the error
     * summary will not be focussed when the page loads.
     */
    disableAutoFocus?: boolean | undefined;
}
