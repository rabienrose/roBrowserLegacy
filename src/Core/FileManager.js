
define(function( require )
{
	'use strict';


	// Load dependencies
	var World      = require('Loaders/World');
	var Ground     = require('Loaders/Ground');
	var Altitude   = require('Loaders/Altitude');
	var Model      = require('Loaders/Model');
	var Sprite     = require('Loaders/Sprite');
	var Action     = require('Loaders/Action');
	var Str        = require('Loaders/Str');


	/**
	 * FileManager namespace
	 */
	var FileManager = {};


	/**
	 * Where is the remote client located ?
	 * @var {string} http
	 */
	FileManager.remoteClient = '';


	/**
	 * Files alias
	 * @var {object}
	 */
	FileManager.filesAlias = {};

	/**
	 * Search a file in each GameFile
	 *
	 * @param {RegExp} regex
	 * @return {Array} filename list
	 */
	FileManager.search = function Search( regex )
	{
		var req    = new XMLHttpRequest();
		req.open('POST', this.remoteClient, false);
		req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		req.overrideMimeType('text/plain; charset=ISO-8859-1');
		req.send('filter=' + encodeURIComponent(regex.source));
		return req.responseText.split('\n');
	};


	/**
	 * Get a file
	 *
	 * @param {string} filename
	 * @param {function} callback
	 */
	FileManager.get = function Get( filename, callback )
	{
		filename = filename.replace(/^\s+|\s+$/g, '');
		FileManager.getHTTP( filename, callback);
	};


	/**
	 * Trying to load a file from the remote host
	 *
	 * @param {string} filename
	 * @param {function} callback
	 */
	FileManager.getHTTP = function GetHTTP( filename, callback )
	{

		filename = filename.replace( /\\/g, '/');
		var url  = filename.replace(/[^//]+/g, function(a){return encodeURIComponent(a);});

		// Use http request here (ajax)
		if (!this.remoteClient) {
			url = '/client/' + url;
		} else {
			url = this.remoteClient + url;
		}

		// Don't load mp3 sounds to avoid blocking the queue
		// They can be load by the HTML5 Audio / Flash directly.
		if (filename.match(/\.(mp3|wav)$/)) {
			callback(url);
			return;
		}
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(){
			if (xhr.status == 200) {
				callback( xhr.response );
			}
			else {
				callback( null, 'Can\'t get file');
			}
		};
		xhr.onerror = function(){
			callback( null, 'Can\'t get file');
		};

		// Can throw an error if not connected to internet
		try {
			xhr.send(null);
		}
		catch(e) {
			callback( null, 'Can\'t get file');
		}
	};


	/**
	 * Load a file
	 *
	 * @param {string} filename
	 * @param {function} callback
	 * @return {string|object}
	 */
	FileManager.load = function Load( filename, callback, args )
	{
		if (!filename) {
			callback(null, 'undefined ?');
			return;
		}

		filename = filename.replace(/^\s+|\s+$/g, '');

		this.get( filename, function(buffer, error){
			var ext    = filename.match(/.[^\.]+$/).toString().substr(1).toLowerCase();
			var result = null;

			if (!buffer || buffer.byteLength === 0) {
				callback(null, error);
				return;
			}

			error  = null;

			try {
				switch (ext) {

					// Regular images files
					case 'jpg':
					case 'jpeg':
					case 'bmp':
					case 'gif':
					case 'png':
						result = URL.createObjectURL(
							new Blob( [buffer], { type: 'image/' + ext })
						);
						break;

					// Audio
					case 'wav':
					case 'mp3':
					case 'ogg':
						// From GRF : change the data to an URI
						if (buffer instanceof ArrayBuffer) {
							result = URL.createObjectURL(
								new Blob( [buffer], { type: 'audio/' + ext })
							);
							break;
						}
						result = buffer;
						break;

					case 'tga':
						result = buffer;
						break;

					// Texts
					case 'txt':
					case 'xml':
					case 'lua':
						var i, count, str, uint8;
						uint8 = new Uint8Array(buffer);
						count = uint8.length;
						str   = '';

						for (i = 0; i < count; ++i) {
							if (uint8[i] === 0) {
								break;
							}
							str += String.fromCharCode( uint8[i] );
						}

						result = str;
						break;

					// Sprite
					case 'spr':
						var spr = new Sprite(buffer);
						if (args && args.to_rgba) {
							spr.switchToRGBA();
						}

						result = spr.compile();
						break;

					// Binary
					case 'rsw':
						result = new World(buffer);
						break;

					case 'gnd':
						result = new Ground(buffer);
						break;

					case 'gat':
						result = new Altitude(buffer);
						break;

					case 'rsm':
					case 'rsm2':
						result = new Model(buffer);
						break;

					case 'act':
						result = new Action(buffer).compile();
						break;

					case 'str':
						result = new Str(buffer, args?.texturePath ?? '');
						break;

					default:
						result = buffer;
						break;
				}
			}

			catch(e) {
				error = e.message;
			}

			callback( result, error );
		});
	};


	/**
	 * Export
	 */
	return FileManager;
});
