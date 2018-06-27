requirejs(["SEnv"],function (SEnv) {
    var data=`
          b0 04 00 00 0a 1b 00 00 00 64 78 65 05 6e 00 66
          00 6b 00 73 00 00 00 76 00 74 00 67 78 00 24 22
          56 ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00
          6b 00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00
          00 64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76
          00 74 00 ff ff ff 15 00 00 00 64 78 65 05 6e 00
          66 00 6b 00 73 00 00 00 76 00 74 00 ff ff ff 15
          00 00 00 64 78 65 05 6e 00 66 00 6b 00 73 00 00
          00 76 00 74 00 ff ff ff 15 00 00 00 64 78 65 05
          6e 00 66 00 6b 00 73 00 00 00 76 00 74 00 ff ff
          ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b 00 73
          00 00 00 76 00 74 00 ff ff ff 15 00 00 00 64 78
          65 05 6e 00 66 00 6b 00 73 00 00 00 76 00 74 00
          ff ff ff 15 00 00 00 64 78 65 05 6e 00 66 00 6b
          00 73 00 00 00 76 00 74 00 ff ff ff 15 00 00 00
          64 78 65 05 6e 00 66 00 6b 00 73 00 00 00 76 00
          74 00 ff ff ff
    `;
    var d=[];
    data.replace(/[0-9a-f]+/g,function (data) {
        d.push("0x"+data-0);
    });

    function load(f) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            // Render thumbnail.
            var a=Array.prototype.slice.call( new Uint8Array(e.target.result) );
            console.log(a);
            window.senv.load(a);
            window.senv.Start();
    /*        var span = document.createElement('span');
            span.innerHTML = ['<img class="thumb" src="', e.target.result,
                              '" title="', escape(theFile.name), '"/>'].join('');
            document.getElementById('list').insertBefore(span, null);*/
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsArrayBuffer(f);
    }
    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.dataTransfer.files; // FileList object.

      // files is a FileList of File objects. List some properties.
      //var output = [];
      for (var i = 0, f; f = files[i]; i++) {
          console.log(f.name,f.type,f.size);
          load(f);
          break;
        /*output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                    f.size, ' bytes, last modified: ',
                    f.lastModifiedDate.toLocaleDateString(), '</li>');*/
      }
      //document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }

    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.querySelector('body');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    window.senv=SEnv();

    var ctx=document.querySelector("#c").getContext("2d");
    /*setInterval(function () {
        window.senv.RefreshPSG(4096);
        //console.log(window.senv.wdata2);
        ctx.clearRect(0,0,1024,256);
        for (var i=0;i<4096;i++) {
            ctx.fillRect(i/4,128+window.senv.wdata2[i]/128,1,256);
        }
    },500);*/
});
