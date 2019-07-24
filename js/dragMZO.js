requirejs([],function () {
    function load(f) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
          return function(e) {
            var a=Array.prototype.slice.call( new Uint8Array(e.target.result) );
            var t=new window.Mezonet.Source(a);
            window.playback=t.playback(window._context );
            window.playback.Start();
          };
        })(f);
        reader.readAsArrayBuffer(f);
    }
    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.dataTransfer.files;

      for (var i = 0, f; f = files[i]; i++) {
          console.log(f.name,f.type,f.size);
          load(f);
          break;
      }
    }

    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
    }

    var dropZone = document.querySelector('body');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

});
