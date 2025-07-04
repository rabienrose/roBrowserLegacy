/**
 * Core/ThreadEventHandler.js
 *
 * Handler data received from Main Thread and process.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

importScripts('../Vendors/require.js');
requirejs.config({
	baseUrl: '../'
});

require(['Core/FileManager', 'Loaders/MapLoader'],
function(      FileManager,           MapLoader )
{
	'use strict';


	/**
	 *	Send an Error to main thread
	 *
	 * @param {string} error
	 */
	function sendError()
	{
		postMessage({ type:'THREAD_ERROR', data: Array.prototype.slice.call(arguments,0) });
	}


	/**
	 *	Send a message log to main thread
	 *
	 * @param {string} error
	 */
	function sendLog()
	{
		postMessage({ type:'THREAD_LOG', data: Array.prototype.slice.call(arguments,0) });
	}


	/**
	 * Receiving data, process action
	 *
	 * @param {object} event - EventHandler
	 */
	onmessage = function receive( event )
	{
		var msg  = event.data;

		switch (msg.type) {

			// Modify client host
			case 'SET_HOST':
				if (msg.data.substr(-1) !== '/') {
					msg.data += '/';
				}
				console.log(msg.data);
				FileManager.remoteClient = msg.data;
				break;

			// Files alias
			case 'CLIENT_FILES_ALIAS':
				FileManager.filesAlias = msg.data;
				break;

			// Get a file from client/grf
			case 'GET_FILE':
				FileManager.get( msg.data.filename, function( result, error){
					if (error) {
						sendError( '[Thread] ' + error + ' ('+ msg.data.filename +')' );
					}

					if (msg.uid) {
						postMessage({
							uid:       msg.uid,
							arguments: [ result, error, msg.data ]
						});
					}
				});
				break;


			// Get and load a file from client/grf
			case 'LOAD_FILE':
				FileManager.load( msg.data.filename, function( result, error){
					if (error) {
						sendError( '[Thread] ' + error + ' ('+ msg.data.filename +')' );
					}

					if (msg.uid) {
						postMessage({
							uid:       msg.uid,
							arguments: [ result, error, msg.data ]
						});
					}
				}, msg.data.args);
				break;


			// Search a file in Client
			case 'SEARCH_FILE':
				if (msg.uid) {
					postMessage({
						uid:       msg.uid,
						arguments: [ FileManager.search( msg.data ), null, msg.data ]
					});
				}
				break;


			// Start loading a map
			case 'LOAD_MAP':
				var map = new MapLoader();

				map.onprogress = function(progress){
					postMessage({ type:'MAP_PROGRESS', data:progress });
				};

				map.onload = function( success, error){
					if (msg.uid) {
						postMessage({
							uid:       msg.uid,
							arguments:[ success, error, msg.data ]
						});
					}
				};

				map.ondata = function( type, data ) {
					postMessage({ type: type, data:data });
				};

				map.load( msg.data );
				break;
		}
	};


	/**
	 * Once the thread is ready
	 */
	postMessage({ type: 'THREAD_READY' });
});
