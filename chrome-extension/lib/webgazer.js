/**
 * WebGazer.js Stub for NeuroRead
 * 
 * This is a lightweight stub for the WebGazer eye tracking library.
 * NeuroRead uses its own custom eye tracking implementation in eye-tracker.js
 * that uses skin-color detection as a proxy for face/gaze detection.
 * 
 * This stub ensures the extension loads without errors when WebGazer 
 * is not available. For enhanced eye tracking accuracy, replace this 
 * file with the full WebGazer library from https://webgazer.cs.brown.edu/
 */

(function () {
    'use strict';

    const webgazer = {
        _isReady: false,
        _listeners: [],
        _videoElement: null,
        _params: {
            showVideo: false,
            showFaceOverlay: false,
            showFaceFeedbackBox: false,
        },

        /**
         * Begin eye tracking (stub - uses NeuroRead's built-in tracker)
         */
        begin: function () {
            console.log('[WebGazer Stub] Using NeuroRead built-in eye tracker');
            this._isReady = true;
            return Promise.resolve(this);
        },

        /**
         * Set gaze listener callback
         */
        setGazeListener: function (listener) {
            if (typeof listener === 'function') {
                this._listeners.push(listener);
            }
            return this;
        },

        /**
         * Clear gaze listener
         */
        clearGazeListener: function () {
            this._listeners = [];
            return this;
        },

        /**
         * Show/hide prediction points
         */
        showPredictionPoints: function (show) {
            return this;
        },

        /**
         * Show/hide video
         */
        showVideo: function (show) {
            this._params.showVideo = show;
            return this;
        },

        /**
         * Show/hide face overlay
         */
        showFaceOverlay: function (show) {
            this._params.showFaceOverlay = show;
            return this;
        },

        /**
         * Show/hide face feedback box
         */
        showFaceFeedbackBox: function (show) {
            this._params.showFaceFeedbackBox = show;
            return this;
        },

        /**
         * Set regression type
         */
        setRegression: function (type) {
            return this;
        },

        /**
         * Set tracker type
         */
        setTracker: function (type) {
            return this;
        },

        /**
         * Pause tracking
         */
        pause: function () {
            return this;
        },

        /**
         * Resume tracking
         */
        resume: function () {
            return this;
        },

        /**
         * End tracking and cleanup
         */
        end: function () {
            this._isReady = false;
            this._listeners = [];
            return this;
        },

        /**
         * Check if ready
         */
        isReady: function () {
            return this._isReady;
        },

        /**
         * Get current prediction (stub returns null)
         */
        getCurrentPrediction: function () {
            return null;
        },

        /**
         * Set static video element
         */
        setStaticVideo: function (videoElement) {
            this._videoElement = videoElement;
            return this;
        },

        /**
         * Params accessor
         */
        params: {
            showVideo: false,
            showFaceOverlay: false,
            showFaceFeedbackBox: false
        }
    };

    // Expose globally
    window.webgazer = webgazer;
})();
