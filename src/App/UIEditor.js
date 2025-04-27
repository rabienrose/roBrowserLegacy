require( {
	baseUrl: './src/',
	paths: {
		text:   'Vendors/text.require',
		jquery: 'Vendors/jquery-1.9.1'
	}
},
	["UI/Components/WinLogin/WinLogin3/WinLogin", 'Core/Thread', 'Core/Client', 'Renderer/Renderer'],
	function(TestUI, Thread, Client, Renderer) {
		'use strict';	
		// ConsoleManager.init();
		// ConsoleManager.toggle();
		Renderer.init();
		var _thread_ready = false;
		function onThreadError( data )
		{
			console.warn.apply( console, data );
		}

		function onThreadLog( data )
		{
			console.log.apply( console, data );
		}
		// Waiting for the Thread to be ready
		if (!_thread_ready) {
			Thread.hook('THREAD_ERROR', onThreadError );
			Thread.hook('THREAD_LOG',   onThreadLog );
			Thread.hook('THREAD_READY', function(){
				_thread_ready = true;
				Client.onFilesLoaded = function(count){
					TestUI.prepare();
					TestUI.append();
				};
				Client.init([]);
			});
		}
		Thread.init();
	}
);
