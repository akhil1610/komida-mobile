/******************************************
// File manager handles photo saving and reading
******************************************/
var fm = function(){
    var fm = this;
    this.filename = "";
    this.data = "";
    this.read = function(filename, data){};
    this.fail = function(error) {alert(JSON.stringify(error));};
    
/******************************************
// filewrite
******************************************/
    this.gotFileWriter = function (writer,o) {
        var infoobj = o;
        writer.onwriteend = function(evt) {
            //infoobj.promise.resolve("Contents of in "+o.filename+" is : "+o.data);
            infoobj.promise.resolve("done");
        };
        writer.fileName = o.filename;
        writer.write(o.data);
    };
    this.gotWriteFileEntry = function(fileEntry,o) {
        var infoobj = o;
        fileEntry.createWriter(function(writer){fm.gotFileWriter(writer,o);}, fm.fail);
    };
    this.writeImageDir = function(dirEntry,o) {
        var infoobj = o;
        dirEntry.getFile(o.filename, {create: true, exclusive: false}, function(fileEntry){fm.gotWriteFileEntry(fileEntry,o);}, fm.fail);
    };
    this.gotWriteFS = function(fileSystem, o) {
        var infoobj = o;
        fileSystem.root.getDirectory("images", {create:true, exclusive:false },  function(dirEntry){fm.writeImageDir(dirEntry,o);}, fm.fail);
    };
    this.write = function(fn, d){
        var filename = fn;
        var data = d;
        var promise = $.Deferred();
        if(filename==null||data==null) {
            promise.reject("No file name/data provided.");
            return promise;
        }
        try{
            window.requestFileSystem(1, 0, function(fileSystem){fm.gotWriteFS(fileSystem,{'filename':filename, 'data':data, 'promise':promise});}, fm.fail);
        }catch(e){};
        return promise;
    };        
    
/******************************************
// file directory delete
******************************************/
    this.delete = function(){
        var promise = $.Deferred();
        window.requestFileSystem(1, 0, function(fileSystem){fm.gotDeleteFS(fileSystem,promise)}, fm.fail);
        return promise;
    };
    this.gotDeleteFS = function(fileSystem, promise){
        var root = fileSystem.root;
        fileSystem.root.getDirectory("images", {create:true, exclusive:false }, function(dirEntry){fm.deleteImageDir(dirEntry,promise);}, fm.fail);
    };
    this.deleteImageDir = function(dirEntry, promise){
        dirEntry.removeRecursively(function(){console.log("Image folder removed.");promise.resolve();},fm.fail);
    };
    
/******************************************
// file read
******************************************/
    this.read = function(fn){
        var filename = fn;
        var promise = $.Deferred();
        window.requestFileSystem(1, 0, function(fileSystem){fm.gotReadFS(fileSystem, {'filename':filename,'promise':promise});}, fm.fail);
        return promise;
    };
    this.gotReadFS = function(fileSystem, o) {
        var root = fileSystem.root;
        var infoobj = o;
        fileSystem.root.getDirectory("images", {create:true, exclusive:false }, function(dirEntry){fm.readImageDir(dirEntry,infoobj);}, fm.fail);
    };
    this.readImageDir = function(dirEntry, o) {
        var infoobj = o;
        dirEntry.getFile(o.filename, {create: true, exclusive: false}, function(fileEntry){fm.gotFileEntry(fileEntry, infoobj);}, fm.fail);
    };
    this.gotFileEntry = function(fileEntry, o) {
        var infoobj = o;
        fileEntry.file(function(file){fm.gotFile(file, infoobj);}, fm.fail);
    };
    this.gotFile = function(file, o){
        var infoobj = o;
        fm.readAsText(file,infoobj);
    };
    this.readDataUrl = function(file,p) {
        var promise = p;
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            promise.resolve(evt.target.result);
        };
        reader.readAsDataURL(file);
    };
    this.readAsText = function(file,o) {
        var infoobj = o;
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            infoobj.promise.resolve(evt.target.result);
        };
        reader.readAsText(file);
    };
};
var fileManager;