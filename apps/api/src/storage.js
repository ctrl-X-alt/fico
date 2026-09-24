const crypto=require("node:crypto");
class StorageAdapter{
  async put(){throw Object.assign(new Error("storage_not_configured"),{code:"storage_not_configured"});}
  async getUrl(){throw Object.assign(new Error("storage_not_configured"),{code:"storage_not_configured"});}
  async delete(){throw Object.assign(new Error("storage_not_configured"),{code:"storage_not_configured"});}
}
class LocalStorageAdapter extends StorageAdapter{
  constructor(root){super();this.root=root||"/tmp/fico-storage";}
  async put(key,buffer,contentType="application/octet-stream"){const fs=require("node:fs/promises"),path=require("node:path");const safe=String(key).replace(/^\/+|\.\.(\/|\\)/g,"");const file=path.join(this.root,safe);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,buffer);return{key:safe,contentType};}
  async delete(key){const fs=require("node:fs/promises"),path=require("node:path");const safe=String(key).replace(/^\/+|\.\.(\/|\\)/g,"");await fs.rm(path.join(this.root,safe),{force:true});}
}
function getStorage(){return process.env.STORAGE_MODE==="local"?new LocalStorageAdapter(process.env.STORAGE_LOCAL_ROOT):new StorageAdapter();}
module.exports={StorageAdapter,LocalStorageAdapter,getStorage};