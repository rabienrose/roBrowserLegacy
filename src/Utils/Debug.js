/**
 * Utils/Debug.js
 *
 * Debug utilities for sending debug messages to server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

define(function() {
	'use strict';

	/**
	 * Send debug message to server
	 * @param {*} message - Message to send, will be converted to string
	 */
	function print_d(message) {
		fetch('/debug', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				message: String(message)
			})
		}).catch(function(err) {
			console.error('Failed to send debug message:', err);
		});
	}

	return print_d;

});
