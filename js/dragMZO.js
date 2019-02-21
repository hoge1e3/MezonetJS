requirejs([],function () {
    function load(f) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
          return function(e) {
            var a=Array.prototype.slice.call( new Uint8Array(e.target.result) );
            var t=window.senv;
            t.load(a);
            t.toAudioBuffer().then(window.playBuffer);

            /*console.log(a);
            window.senv.load(a);
            window.senv.Start();*/
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
