class StorageAdapter{
  async put(){throw new Error("storage_not_configured");}
  async getUrl(){throw new Error("storage_not_configured");}
  async delete(){throw new Error("storage_not_configured");}
}
function getStorage(){return new StorageAdapter();}
module.exports={StorageAdapter,getStorage};